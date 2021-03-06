/**
 * A generic library for maps loading.
 * Aims to support:
 *  - static remote files: on the http server
 *  - localStorage: via the localStorage API
 *  - database: a javascript database (not defined yet)
 **/
function LocalStorageMaps()
{
    var prefix = "map_";
    var list_name = "maps";
    function prefixed_name_to_name(name)
    {
        return name.substring(prefix.length);
    }
    function list_names()
    {
        if(!localStorage[list_name])
        {
            localStorage[list_name] = JSON.stringify({});
            return {};
        }
        else
        {
            try
            {
                return JSON.parse(localStorage[list_name]);
            }
            catch(SyntaxError)
            {
                localStorage[list_name] = JSON.stringify({});
                return {};
            }
        }
    }
    this.list = function(callback)
    {
        var result = [];
        var names = list_names();
        for(var name in names)
            result.push(prefixed_name_to_name(name));
        callback(result);
    }
    this.load = function(name, callback)
    {
        var str = localStorage[prefix + name];
        if(str == undefined)
            alert("map " + name + " does not exist");
        callback(JSON.parse(str));
    }
    this.save = function(name, value, callback)
    {
        var maps = JSON.parse(localStorage[list_name])
        localStorage[prefix + name] = JSON.stringify(value);
        maps[prefix + name] = true;
        localStorage[list_name] = JSON.stringify(maps);
        callback();
    }
    this.delete = function(name, callback)
    {
        localStorage.removeItem(prefix + name);
        var maps = JSON.parse(localStorage[list_name])
        maps[prefix + name] = undefined;
        localStorage[list_name] = JSON.stringify(maps);
        callback();
    }
    this.deleteAll = function(callback)
    {
        for(var name in this.list())
            this.delete(name, function() {})
        localStorage.removeItem(list_name);
        callback();
    }
}
function HttpImageStorageMaps()
{
    var map_directory = "./map/";
    var list_path = map_directory + "list.json";
    function get_list(callback)
    {
        $.getJSON(list_path,
                function(list, textStatus, jqXHR) {
                    callback(list); }).error(function() {
            console.log("error opening " + list_path); });
    }
    this.list = function(callback)
    {
        get_list(function(names) {
            var result = [];
            for(var name in names) {
                result.push(name);} callback(result); });
    }
    this.load = function(name, callback)
    {
        get_list(function(list) {
            var image = new Image();
            $(image).load(function() {
                callback(image_to_map(image));
            });
            image.src = "map/"  + list[name].path;
        });
    }
    this.save = function(name, value, callback)
    {
        console.log("not implemented");
    }
    this.delete = function(name, callback)
    {
        console.log("not implemented");
    }
    this.deleteAll = function(callback)
    {
        console.log("not implemented");
    }
}
function ProceduralStorageMaps()
{
    this.load = function(yield, callback)
    {
        var map = { nails: [], cases: []};
        var editor = { draw_line: function draw_line(
                x0, y0, x1, y1, m)
            {
                if(m == undefined) m == 1;
                var dy = (y1 - y0);
                var dx = (x1 - x0);
                var n = Math.sqrt(dx * dx + dy * dy);
                dx /= n; dy /= n;
                for(var i = 0; i < n; i++)
                    if(i % m == 0)
                        map.nails.push([(x0 + i * dx) / 100,
                                (y0 + i * dy) / 200]);
            }, add_case: function(_case)
            {
                map.cases.push(_case);
            } };
        yield(editor);
        callback(map);
    }
}
function MapsFactory(type)
{
    if(type == "localStorage")
        return new LocalStorageMaps();
    else if(type == "http")
        return new HttpImageStorageMaps();
    else if(type == "procedural")
        return new ProceduralStorageMaps();
}
function Levels()
{
    this.each = function(callback)
    {
        $.getJSON("levels.json",
                function(levels, textStatus, jqXHR) {
                    for(i in levels) {
                        var level = levels[i];
                        callback(level[0], level[1]);
                    }
                });
    }
    this.open = function(id, callback)
    {
        $.getJSON("level/" + id + ".json",
                function(level, textStatus, jqXHR) {
                    for(var i in level.game) {
                        var game = level.game[i];
                        if(!("achievements_ids" in game)) { 
                            game.achievements_ids = [];
                        }
                        var ids = game.achievements_ids;
                        for(var j in ids) {
                            ids[j] = id + "/" + ids[j]
                        }
                        if(!("prerequisites" in game)) {
                            game.prerequisites = {};
                        }
                        if(!("achievements_ids" in game.prerequisites))
        {
            game.prerequisites.achievements_ids = [];
        }
        var ids = game.prerequisites.achievements_ids;
        for(var j in ids) {
            ids[j] = id + "/" + ids[j]
        }
                    }
                    callback(level);
                }).error(function(a, b, c) {
            console.log("error while loading level " + id);
            console.log(b);
        });
    }
}
