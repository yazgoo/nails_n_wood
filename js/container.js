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
    this.pushState = function()
    {
        window.history.pushState(this.html(), "Title");
        var container = this;
        window.addEventListener('popstate', function(event) {
            if(event.state == null) return;
            container.clear();
            container.setHtml(event.state);
        });
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
        function Button(name, callback)
        {
            ContainerCallbacks.push(callback);
            this.callback_id = ContainerCallbacks.length - 1;
            this.html = function()
            {
                return '<input type="button" ' +
                    'onclick="ContainerCallbacks['
                    + this.callback_id  + '](\''+name+'\');" ' +
                    'value="' + name + '" id="map"/>';
            }
        }
        this.addButton = function(name, callback)
        {
            buttons.push(new Button(name, callback));
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
