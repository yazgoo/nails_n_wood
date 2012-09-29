console.log("tests");
function tests(what)
{
    var tests_items = [
    {
        map: empty,
            x: -25,
            end: function(tester) { check(!tester._case.ok); }
    },
    {
        map: empty,
        x: 25,
        end: function(tester) { check(tester._case.ok); }
    },
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
    {
        map: m1,
        x: -41,
        end: function(tester) { check(!tester._case.ok); }
    },
    {
        map: m1,
        x: -39.5,
        end: function(tester) { check(!tester._case.ok); }
    },
    {
        map: m0,
        x: 0,
        end: function(tester) { check(!tester._case.ok); }
    }
    ];
    if(what == undefined)
        return tests_items;
    var result = [];
    for(var i in what)
        result.push(tests_items[parseInt(what[i])]);
    return result;
}
