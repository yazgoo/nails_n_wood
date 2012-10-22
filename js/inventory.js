function Inventory()
{
    var credits_count = "credits_count";
    var unlocked_achievements = "unlocked_achievements";
    var default_values = {
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
    this.achievement_unlocked = function(achievement)
    {
        return _(unlocked_achievements)[achievement.id];
    }
    this.achievement_unlock = function(achievement)
    {
        if(this.achievement_unlocked(achievement.id)) return this;
        achievements = _(unlocked_achievements);
        achievements[achievement.id] = true;
        this.credits_add(achievement.price);
        _(unlocked_achievements, achievements);
        return this;
    }
    this.achievements_locked_ids_get_from_ids = function(ids)
    {
        achievements_locked_ids = [];
        for(i in ids)
            if(!_(unlocked_achievements)[ids[i]])
                result.push(ids[i]);
        return achievements_locked_ids;
    }
    return this;
}
function Achievements(id)
{
    this.get = function(callback)
    {
        $.getJSON("achievements/" + id + ".json",
                function(achievements, textStatus, jqXHR) {
                    for(id in achievements)
                        achievements[id].id = id;
                    callback(achievements);
                }).error(function(a, b, c) {
            console.log("error while loading level " + id);
            console.log(b);
        });
    }
    return this;
}
