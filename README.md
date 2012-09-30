nails'n wood
============
Description
---------
A pachinko inspired game in webGL.
You can play it [here](http://naw1-yazgoo.rhcloud.com/).
Screenshots
-----------
[![Menu screenshot](http://cloud.github.com/downloads/yazgoo/nails_n_wood/nails_n_wood_capture_menu_small.png)](http://cloud.github.com/downloads/yazgoo/nails_n_wood/nails_n_wood_capture_menu.png)
[![In game screenshot](http://cloud.github.com/downloads/yazgoo/nails_n_wood/nails_n_wood_capture_game_small.png)](http://cloud.github.com/downloads/yazgoo/nails_n_wood/nails_n_wood_capture_game.png)
Licensing
---------
For all original components, AGPLv3.
Installing
----------
    git clone git://github.com/yazgoo/nails_n_wood.git
Running
-------
Point your browser to nails'n wood directory or to index.html
Map designing
-------------
To edit maps, just run the editor via the main interface or open
editor.html.
You can also create maps with your favourite image editor.
Here are current conventions:

- use width 100 x height 200 pixel
- a black pixel's a nail

To draw the targets, on the last line, put the pixels colors:

- ok sign: green
- not ok sign: red
- limit between two targets: blue

Automated tests
---------------

It is possible to replay pre-defined game scenarii.
You can play selected tests (here #3 and #7) via:
    tst/game.html?tests_names=3,7
If you want to play all tests, just don't specify tests\_names.
A scenario uses procedural maps which are declared in:
    tst/tests_maps.js
Procedural maps are functions which draw maps.
Here is such a map:
    var my_map = function(map)
    {
        // draw a line of nails from (0, 0) to (90, 190)
        // draw a nail every two pixels
        map.draw_line(0, 0, 90, 190, 2);
        // add an ok target, with a limit at 50% off the map
        // sign position is where the decoration ok sign will be drawn
        map.add_case({ok: 1, sign_position: 0.25, position: 0.5});
        // add a nok target
        map.add_case({nok: 0, sign_position: 0.75});
    }
A scenario is declared in:
    tst/tests.js
Just add to tests\_items variable a scenario, for example:
    {
        // name of the map to use
        map: my_map,
        // initial coordinate where the marble will be droped from
        x: 75,
        // called on the end of the game
        // here, we check that the target where the marble will
        // be is !ok
        end: function(tester) { check(!tester._case.ok); }
    }
Sometime, the marble will get stuck (you also might want to test that).
In that case, you will add a timeout value to the map. When this timeout
is reached and the marble has not hit any target, «end» will be called.
In this case tester.\_case value will be irelevant, since no target will
be hit.
    {
        map: empty,
        x: 0,
        timeout: 10000,
        end: function(tester)
        {
            var x = tester.game.getMarble().position.x;
            check(x > 0 && x < 2, x);
        }
    },
