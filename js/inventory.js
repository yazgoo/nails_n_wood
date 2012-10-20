function Inventory()
{
    var credits_count = "credits_count";
    var unlocked_achievements = "unlocked_achievements";
    var default_values = default_values = {
            credits_count: 0,
            unlocked_achievements: {}
        };
    function get_full_name(name)
    {
        return "inventory_" + name;
    }
    this.reset = function(value)
    {
        for(i in default_values)
            localStorage.removeItem(get_full_name(i));
    }
    function _(name, value)
    {
        var fullname = get_full_name(name);
        if(value == undefined)
        {
            var string = localStorage[fullname];
            if(string != undefined) return JSON.parse(string);
            var default_value = default_values[name];
            value = default_value == undefined ?{}:default_value;
        }
        console.log(value);
        localStorage[fullname] = JSON.stringify(value);
        return value;
    }
    this.credits = function(value)
    {
        if(value == undefined) return _(credits_count);
        else _(credits_count, value);
        return this;
    }
    this.credits_add = function(value)
    {
        _(credits_count, _(credits_count) + value);
        return this;
    }
    this.achievement_unlocked = function(id)
    {
        return _(unlocked_achievements)[id];
    }
    this.achievement_unlock = function(id)
    {
        if(this.achievement_unlocked(id)) return this;
        achievements = _(unlocked_achievements);
        achievements[id] = true;
        _(unlocked_achievements, achievements);
        return this;
    }
    return this;
}
