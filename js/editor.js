var tool;
var canvas;
var color;
var pixels = [];
var factory = MapsFactory("localStorage");
function set_size(id, new_size)
{
    $("#" + id).css(
            {
                width: new_size,
            height: new_size,
            "background-size": new_size + " " + new_size,
            position: "relative",
            }
            );
}
function hexc(colorval) {
    var parts = colorval.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    delete(parts[0]);
    for (var i = 1; i <= 3; ++i) {
        parts[i] = parseInt(parts[i]).toString(16);
        if (parts[i].length == 1) parts[i] = '0' + parts[i];
    }
    return '#' + parts.join('');
}
function select_tool(what)
{
    tool = $(what).attr('id');
    color = hexc($(what).css("color"));
    $(".edit_button").each(function(i)
            {
                var new_id = $(this).attr('id');
                if(new_id != tool) set_size(new_id, "30px");
            });
    set_size(tool, "45px");
}
function set_context_pixel_color(context, pixel, color, size, size2)
{
    if(size2 == undefined) size2 = size;
    context.fillStyle = color;
    context.fillRect(pixel.x, pixel.y, size, size2);
}
function set_canvas_pixel_color(canvas, pixel, color, size, size2)
{
    set_context_pixel_color(canvas[0].getContext('2d'),
            pixel, color, size, size2);
}
function set_pixel_color(e, color, noy)
{
    if(!color) return;
    var context = canvas[0].getContext('2d');
    var x = Math.floor(e.pageX - canvas.offset().left);
    var y = noy? canvas[0].height - 4:Math.floor(e.pageY - canvas.offset().top);
    var pixel = {x: x, y: y};
    set_context_pixel_color(context, pixel, color, 4);
    pixels.push(pixel);
}
function undo()
{
    if(pixels.length == 0) return;
    var context = canvas[0].getContext('2d');
    pixel = pixels.pop();
    set_context_pixel_color(context, pixel, "#ffffff", 4);
}
function setup_canvas()
{
    var width = 400;
    var height = 800;
    if(canvas == undefined)
    {
        canvas = $('<canvas/>').css( {
            width: width + 'px',
            height: height + 'px',
               border: "2px solid black"
        });
        canvas[0].width = width;
        canvas[0].height = height;
        set_context_pixel_color(canvas[0].getContext('2d'),
                {x: 0, y: 0}, "#ffffff", width, height);
    }
}
function setup_editor()
{
    $("#title").val("");
    setup_canvas();
    $("body").append(canvas);
    canvas.click(function (e) { set_pixel_color(e, color,
                color != "#000000"); });
}
function save()
{
    var title = $("#title").val();
    if(title == "")
    {
        alert("please select a title for your map");
        return;
    }
    factory.save(title, canvas_to_map(canvas[0], 4),
            setup_maps_list);
}
function delete_map()
{
    factory.delete($("#title").val(), setup_maps_list);
}
function clear_maps()
{
    factory.deleteAll(setup_maps_list);
}
function load_map_from_name(name)
{
    if(name == "") return;
    $("#title").val(name)
    factory.load(name,
            function(map) { load_map(map); });
}
function load_map(map)
{
    setup_canvas();
    for(i in map.nails)
        set_canvas_pixel_color(canvas,
                {x: map.nails[i][0] * canvas[0].width,
                    y: map.nails[i][1] * canvas[0].height},
                "#000000", 4, 4);
    for(i in map.cases)
    {
        var _case = map.cases[i];
        var y = canvas[0].height - 4;
        set_canvas_pixel_color(canvas,
                {x: _case.sign_position * canvas[0].width,
                    y: y},
                _case.ok ? "#00ff00" : "#ff0000", 4, 4);
        if(_case.position != undefined)
            set_canvas_pixel_color(canvas,
                    {x: _case.position * canvas[0].width,
                        y: y},
                        "#0000ff", 4, 4);
    }
}
function setup_maps_list()
{
    var maps = factory.list();
    var list = $("#maps");
    list.html("<option value=''></option>");
    for(i in maps) list.append( $("<option value="
                + maps[i] + ">" + maps[i] + "</option>"));
    list.change( function() { load_map_from_name($(this).val()) });
}
