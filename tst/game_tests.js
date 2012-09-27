function setup_controls()
{
}
function run_test_games(tests)
{
    var tester = this;
    this.run_test_game = function()
    {
        console.log(this.test.map);
        this.game.clean();
        this.maps.load(this.test.map,
                this.game.load_and_setup_map);
        this.game.restart();
        this.game.marble_position_set(this.test.x);
        this.game.marble_drop();
    }
    this.game = new Game();
    var i = 0;
    var c = 0;
    game.setup_interface('physijs_worker.js', 'js/ammo.js');
    game.main();
    this.tests = tests;
    this.test = tests[i];
    this.maps = MapsFactory("procedural");
    this.check = function(bool)
    {
        console.log("test #" + i + " check: " + (bool?"ok":"nok"));
        c++;
    }
    game.end_game_callback = function(x, _case)
    {
        console.log("done with game " + i);
        tester.x = x;
        tester._case = _case;
        test.end(tester);
        i++;
        if(i >= tests.length) console.log("done");
        else
        {
            c = 0;
            test = tests[i];
            tester.run_test_game();
        }
    };
    run_test_game();
}
