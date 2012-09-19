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
        console.log(names);
        return result;
    }
    this.load = function(name, callback)
    {
        callback(JSON.parse(localStorage[prefix + name]));
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
                    callback(list); }).error(function() { alert("error"); });
    }
    this.list = function(callback)
    {
        get_list(function(names) {
            var result = [];
            for(var name in names) {
                result.push(name); callback(result);} });
    }
    this.load = function(name, callback)
    {
        get_list(function(list) {
            console.log(list);
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
function MapsFactory(type)
{
    console.log(localStorage);
    if(type == "localStorage")
        return new LocalStorageMaps();
    else if(type == "http")
        return new HttpImageStorageMaps();
}