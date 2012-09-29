function setup_controls()
{
}
function run_test_games(tests)
{
    var tester = this;
    this.interval = undefined;
    this.run_test_game = function()
    {
        if(this.test.timeout != undefined)
            this.interval = window.setTimeout(function()
                    {
                        tester.test.end(tester);
                        tester.next_test();
                    }, this.test.timeout);
        this.game.clean();
        this.maps.load(this.test.map,
                this.game.load_and_setup_map);
        this.game.restart();
        this.game.marble_position_set(this.test.x);
        this.game.marble_drop();
    }
    this.game = new Game();
    this.c = 0;
    this.counter = 0;
    game.setup_interface('physijs_worker.js', 'js/ammo.js');
    game.main();
    this.tests = tests;
    this.test = tests[this.counter];
    this.maps = MapsFactory("procedural");
    this.check = function(bool, error_message)
    {
        console.log("test #" + this.counter
                + " check: " + (bool?"ok":"nok: " + error_message));
        c++;
    }
    this.next_test = function()
    {
        this.counter++;
        if(this.counter >= this.tests.length) console.log("done");
        else
        {
            this.c = 0;
            this.test = tests[this.counter];
            this.run_test_game();
        }
    }
    game.end_game_callback = function(position, _case)
    {
        window.clearInterval(tester.interval);
        console.log("done with game " + counter);
        tester._case = _case;
        test.end(tester);
        tester.next_test();
    };
    run_test_game();
}
