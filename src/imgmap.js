SVG.Rect.prototype.aid = 0;
SVG.Circle.prototype.aid = 0;
SVG.Polygon.prototype.aid = 0;

var filename = "";
var drawing = new SVG('graph');

/* File drag/drop */
function createObjectURL(object) {
    return (window.URL) ? window.URL.createObjectURL(object) : window.webkitURL.createObjectURL(object);
}

function revokeObjectURL(url) {
    return (window.URL) ? window.URL.revokeObjectURL(url) : window.webkitURL.revokeObjectURL(url);
}

function handleFile() {
  if(this.files.length) {
    var image = new Image();
    image.src = createObjectURL(this.files[0]);
    // Set SVG viewBox
    image.onload = function() {
      drawing.node.setAttribute("viewBox", `0 0 ${image.width} ${image.height}`);
    }
    filename = this.files[0].name;
    document.getElementById("mapped_image").setAttribute("src", image.src);
    document.getElementById("mapped_content").style.display = "unset";
  }
  generate_html();
}

function handleDragFile(file) {
  var image = new Image();
  image.src = createObjectURL(file);
  // Set SVG viewBox
  image.onload = function() {
    drawing.node.setAttribute("viewBox", `0 0 ${image.width} ${image.height}`);
  }
  filename = file.name;
  document.getElementById("mapped_image").setAttribute("src", image.src);
  document.getElementById("mapped_content").style.display = "unset";
  generate_html();
}

function handleDrop(event) {
  event.preventDefault();

  if (event.dataTransfer.items) {
    // Use DataTransferItemList interface to access the file(s)
    for (var i = 0; i < event.dataTransfer.items.length; i++) {
      // If dropped items aren't files, reject them
      if (event.dataTransfer.items[i].kind === 'file') {
        var file = event.dataTransfer.items[i].getAsFile();
        handleDragFile(file);
      }
    }
  }
  removeDragData(event);
}

function removeDragData(ev) {
  if (ev.dataTransfer.items) {
    // Use DataTransferItemList interface to remove the drag data
    ev.dataTransfer.items.clear();
  } else {
    // Use DataTransfer interface to remove the drag data
    ev.dataTransfer.clearData();
  }
  document.getElementById("drag_box").style.display = "none";
}

function handleDrag(event) {
  event.preventDefault();
  console.log('dragover');
  document.getElementById("drag_box").style.display = "unset";
}

document.getElementById("file").addEventListener("change", handleFile, false);

document.addEventListener("drop", handleDrop, false);
document.addEventListener("dragover", handleDrag, false);
document.addEventListener("dragend", function() {
  console.log('dragend');
  document.getElementById("drag_box").style.display = "none";
}, false);
/* End of file drag/drop */

var set_shape = "rect";

function set_rect() {
  document.getElementById("draw_circle").classList.remove("pure-button-active");
  document.getElementById("draw_poly").classList.remove("pure-button-active");
  document.getElementById("draw_rect").classList.add("pure-button-active");
  set_shape = 'rect';
}
function set_circle() {
  document.getElementById("draw_rect").classList.remove("pure-button-active");
  document.getElementById("draw_poly").classList.remove("pure-button-active");
  document.getElementById("draw_circle").classList.add("pure-button-active");
  set_shape = 'circle';
}
function set_poly() {
  document.getElementById("draw_rect").classList.remove("pure-button-active");
  document.getElementById("draw_circle").classList.remove("pure-button-active");
  document.getElementById("draw_poly").classList.add("pure-button-active");
  set_shape = 'poly';
}

function delete_shape(e, delete_id = false) {
  console.log('109');

  if (delete_id) {
    r = rects[delete_id];
    console.log('id', r, delete_id);
  } else if (shape_selected > -1) {
    r = rects[shape_selected];
    console.log('shape_selected', r);
  } else {
    return false;
  }

  if (r.type == 'polygon') {
    r.selectize(false, {deepSelect:true});
  } else {
    r.selectize(false);
  }
  r.remove();
  rects.splice(shape_selected, 1);
  shape_selected = -1;

  hi = document.getElementById(`href-${r.aid}`);
  ti = document.getElementById(`title-${r.aid}`);

  // Remove <fieldset> element
  // which has href and title inputs as child
  hi.parentNode.parentNode.removeChild(hi.parentNode);

  fix_aids();
}

function fix_aids() {
  // Update all aids
  for (i = 0; i < rects.length; i++) {
    r = rects[i];

    // Update HTML ids
    document.getElementById(`href-${r.aid}`).id = `href-${i}`;
    document.getElementById(`title-${r.aid}`).id =  `title-${i}`;

    r.aid = i;
  }
}

var rects = [];

var in_shape = false;
var shape_selected = -1;

function deselect_shapes() {
  if (shape_selected > -1) {
    // De-select everything
    for (i = 0; i < rects.length; i++) {
      rects[i].selectize(false);
    }
    shape_selected = -1;
  }
}

function generate_html() {
  var html = "";
  html += `<img src="${filename}" usemap="#image_map">\n`;
  html += `<map name="image_map">\n`;
  for (i = 0; i < rects.length; i++) {
    r = rects[i];
    type = r.type;

    if (type == 'rect') {
      start = `${Math.round(r.attr('x'))},${Math.round(r.attr('y'))}`;
      end = `${Math.round(r.attr('x') + r.width())},${Math.round(r.attr('y') + r.height())}`;
      coords = `${start},${end}`;
    } else if (type == 'circle') {
      start = `${Math.round(r.attr('cx'))},${Math.round(r.attr('cy'))}`;
      radius = Math.round(r.attr('r'));

      coords = `${start},${radius}`;
    } else if (type == 'polygon') {
      console.log('generating polygon coords');
      coords = "";
      complete = false;
      r.attr('points').split(/[, ]/).forEach(function(p) {
        coords += Math.round(p);
        if (!complete) {
          coords += ',';
          complete = true;
        } else {
          coords += ' ';
          complete = false;
        }
      });

    }

    var href = document.getElementById(`href-${r.aid}`).value
    var title = document.getElementById(`title-${r.aid}`).value

    html += `  <area alt="${title}" title="${title}" href="${href}" coords="${coords}" shape="${type}">\n`;
  }
  html += `</map>\n`;
  document.getElementById("ta_html").value = html;
}

function add_href_input(ro) {
  var fs = document.createElement("fieldset");
  var hi = document.createElement("input");
  var ti = document.createElement("input");

  fs.classList.add("pure-group");

  fs.appendChild(hi);
  fs.appendChild(ti);

  hi.id = `href-${ro.aid}`;
  ti.id = `title-${ro.aid}`;

  hi.setAttribute("type", "text")
  hi.setAttribute("placeholder", "href")
  ti.setAttribute("type", "text")
  ti.setAttribute("placeholder", "title")

  hi.addEventListener("keyup", function() {
    generate_html();
  }, false);
  ti.addEventListener("keyup", function() {
    generate_html();
  }, false);

  // When focusing on the input, select the shape
  hi.addEventListener("focus", function() {
    console.log(ro.aid);
    deselect_shapes();
    ro.selectize(true);

    if (ro.type == "rect" | ro.type == "circle") {
      ro.selectize(true, {deepSelect: true, rotationPoint: false}).resize();
    } else {
      ro.selectize(true, {deepSelect: false, rotationPoint: false}).resize();
    }

    shape_selected = ro.aid;
  }, false);
  ti.addEventListener("focus", function() {
    console.log(ro.aid);
    deselect_shapes();
    ro.selectize(true);

    if (ro.type == "rect" | ro.type == "circle") {
      ro.selectize(true, {deepSelect: true, rotationPoint: false}).resize();
    } else {
      ro.selectize(true, {deepSelect: false, rotationPoint: false}).resize();
    }

    shape_selected = ro.aid;

  }, false);



  document.getElementById("form_href").appendChild(fs);
}


document.getElementById("draw_rect").addEventListener("click", set_rect, false);
document.getElementById("draw_circle").addEventListener("click", set_circle, false);
document.getElementById("draw_poly").addEventListener("click", set_poly, false);
document.getElementById("delete").addEventListener("click", delete_shape, false);

drawing.on("mousedown", function(e) {
  deselect_shapes();

  if (in_shape) {
    return false;
  }

  if (set_shape == 'rect') {
    rects.push(drawing.rect());
  } else if (set_shape == 'circle') {
    rects.push(drawing.circle());
  } else if (set_shape == 'poly') {
    rects.push(drawing.polygon());
  }

  in_shape = true;

  r = rects[rects.length - 1];
  r.aid = rects.length - 1;

  if (set_shape == 'poly') {
    r.draw().opacity('.3');
  } else {
    r.draw(e).fill("#333").opacity('.3');
  }

  if (set_shape == 'poly') {
    r.on('drawstart', function(e){
      //document.addEventListener('dblclick', function (e) {
      //    console.log('doubleclick')
      //});
      //document.addEventListener('dblclick', function(e){
      document.addEventListener('keydown', function(e){
        console.log('keydown', e.keyCode);
        if(e.keyCode == 13 || e.keyCode == 27){
          r.draw('done');
          r.off('drawstart');
          in_shape = false;
        }
      });
    });
  }


  r.draggable().on('dragmove', function(e){
    //e.preventDefault()
    generate_html();
  });

  r.on('drawstop', function(){
    console.log('drawstop');
    add_href_input(this);
  });


  // Make selectable
  r.on('mousedown', function(e) {
    deselect_shapes();
    if (set_shape == 'poly') {
      //this.selectize().selectize({deepSelect:true}).resize();
      // deepSelect for polygons
      this.selectize(true, {deepSelect: true, rotationPoint: false}).resize();
    } else {
      this.selectize(true, {deepSelect: false, rotationPoint: false}).resize();
    }
    shape_selected = this.aid;
  }, false);


}, false);

drawing.on('mouseup', function(e){
  if (set_shape == 'poly') {
    return false;
  }

  r = rects[rects.length - 1];
  r.draw('stop', e);
  in_shape = false;

  // if in same place, pop
  if (r.width() == 0 || r.height() == 0) {
    console.log('deleting empty shape ', r.attr('x'), r.attr('y'), r.width(), r.height());
    delete_shape(e, r.aid);
  }
  

  generate_html();
}, false);

document.getElementById("ta_html").value = "";
