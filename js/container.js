var ContainerCallbacks = [];
function Container(name, callback)
{
    this.items = [];
    this.html = function()
    {
        str = "";
        for(i in this.items)
        {
            str += this.items[i].html();
        }
        return str;
    }
    this.render = function()
    {
        $(name).html(this.html());
        return this;
    }
    this.setHtml = function(data)
    {
        this.items.push(new function()
                {
                    this.html = function()
        {
            return data;
        }
                });
        this.render();
    }
    this.addLink = function(url, text)
    {
        this.setHtml("<a href='" + url + "'>" + text + "</a>");
    }
    this.include = function(page, map)
    {
        var container = this;
        var add = "";
        this.parameters = map;
        $.get(page, function(data, textStatus, jqXHR)
                {
                    container.setHtml(data);
                }, "text");
        return this;
    }
    this.html_contents = {};
    var html_contents = this.html_contents;
    window.addEventListener('popstate', function(event) {
        console.log("popstate " + event.state);
        var contents = html_contents[event.state];
        if(contents == undefined) return;
        container.clear();
        // event.state
        container.setHtml(contents);
    });
    this.pushState = function(id)
    {
        var html = this.html();
        console.log("push state " + id);
        window.history.pushState(id, "Title");
        this.html_contents[id] = html;
        var container = this;
        var html_contents = this.html_contents;
        return this;
    }
    this.clear = function()
    {
        this.items = [];
        this.render();
        return this;
    }
    this.addImage = function(path)
    {
        this.items.push(new function() { this.html = function()
            {
                return "<img width='450' src='" + path + "'/>";
            }
        });
        return this;
    }
    function Section(name, callback)
    {
        var buttons = [];
        function Button(name, callback, id)
        {
            ContainerCallbacks.push(callback);
            this.callback_id = ContainerCallbacks.length - 1;
            this.html = function()
            {
                var parameters = '\''+name+'\'';
                if(id != undefined) parameters += ', \''+id+'\'';
                return '<input type="button" ' +
                    'onclick="ContainerCallbacks['
                    + this.callback_id  + ']('+parameters+');" ' +
                    'value="' + name + '" id="map"/>';
            }
        }
        function Toggle(default_state,
                        on_value, off_value, callback)
        {
            ContainerCallbacks.push(callback);
            this.callback_id = ContainerCallbacks.length - 1;
            this.html = function()
            {
                var values = [on_value, off_value];
                if(default_state == 0) values.reverse();
                return '<input type="button" ' +
                    'onclick="this.value=(this.value==\''
                    + values[1] + '\'?\'' + values[0] + '\':\''
                    + values[1] + '\');ContainerCallbacks['
                    + this.callback_id  + '](this.value == \''
                            +on_value+'\');" ' +
                    'value="' + values[0] + '" id="map"/>';
            }
        }
        this.addButton = function(name, callback, id)
        {
            buttons.push(new Button(name, callback, id));
        }
        this.addToggle = function(default_state,
                on_value, off_value, callback)
        {
            buttons.push(new Toggle(default_state,
                        on_value, off_value, callback));
        }
        this.html = function()
        {
            str = '<div id="title">' + name
                + '</div><div id="list">';
            for(i in buttons)
            {
                str += buttons[i].html();
            }
            return str + '</div>';
        }
        callback(this);
    }
    this.addSection = function(name, callback)
    {
        this.items.push(new Section(name, callback));
        return this;
    }
    callback(this);
}

