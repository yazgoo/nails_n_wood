function canvas_to_map(canvas, scale)
{
    var height = canvas.height;
    var width = canvas.width;
    var context = canvas.getContext('2d');
    var map = [];
    var data = context.getImageData(
            0, 0, width, height).data;
    for(var y = 0; y < height; y += scale)
        for(var x = 0; x < width; x += scale)
        {
            var i = (y * width + x) * 4;
            if(!data[i] && !data[i+1] && !data[i+2])
            {
                map.push([x/width, y/height]);
            }
        }
    cases = []
    for(var x = 0; x < width; x += scale)
    {
        var i = ((height - 1) * width + x) * 4;
        if((data[i] || data[i+1]) && !data[i+2])
            cases.push({ok: data[i+1] != 0, sign_position:
                x / width});
        else if(!data[i] && !data[i+1] && data[i+2])
            cases[cases.length - 1].position = x / width;
    }
    return {nails: map, cases: cases};
}
