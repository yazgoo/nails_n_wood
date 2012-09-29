var m0 = function(map)
{
    map.draw_line(0, 0, 90, 190, 2);
    map.add_case({ok: 1, sign_position: 0.25, position: 0.5});
    map.add_case({ok: 0, sign_position: 0.75});
}
var m1 = function(map)
{
    map.draw_line(10, 10, 70, 50, 4);
    map.draw_line(90, 60, 10, 100, 3);
    map.draw_line(0, 100, 90, 170, 2);
    map.add_case({ok: 1, sign_position: 0.25, position: 0.5});
    map.add_case({ok: 0, sign_position: 0.75});
}
var empty = function(map)
{
    map.add_case({ok: 0, sign_position: 0.25, position: 0.5});
    map.add_case({ok: 1, sign_position: 0.75});
}
