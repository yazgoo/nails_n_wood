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
    this.list = function()
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
function MapsFactory(type)
{
    console.log(localStorage);
    if(type == "localStorage")
        return new LocalStorageMaps();
}
