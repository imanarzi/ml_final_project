var reloading;


function toggleAutoRefresh(cb) {
    //if (cb.checked) {
        localStorage.setItem("clist", JSON.stringify(checked_list()));
        window.location.replace("#autoreload");
        reloading=setTimeout("window.location.reload();", 500);
        //console.log(checked_list());
        
    //} else {
        
    //    window.location.replace("#");
    //    clearTimeout(reloading);
    //}
}

//window.onload = checkReloading;

var div = document.getElementById("filter");
var list = document.createElement("ul");
list.id = "filter_list";
list.style="list-style-type:none;"
d3.json("nodes.json", function(error, data){
    var names = data.nodes;
    //console.log(names);
    //console.log(names);
    for(var i = 0; i < names.length; i++){
        var item = document.createElement("li");
        item.innerHTML ="<label><input type='checkbox' class='filt' data-criteria=" + names[i] + " />" + names[i] + "</label>";
        list.appendChild(item);
    }
    var go_btn = document.createElement("button");
    go_btn.innerHTML = "<label onclick='toggleAutoRefresh(this);'> Go </label>";
    list.appendChild(go_btn);
    div.appendChild(list);
    var clist = JSON.parse(localStorage.getItem("clist"));
    var index;
    for(var i = 0; i < clist.length; i++){
        for(var j = 0; j < names.length; j++){
            if(clist[i] === names[j]){
                index = j;
                
            }
        }
        if(index || index == 0)
        document.getElementsByClassName("filt")[index].checked = true;
    }
    //console.log(clist);
    //console.log(names);
    //document.getElementsByClassName("filt")[5].checked = true;*/

});

function checked_list(){
    var checked = [];
    var f = document.getElementsByClassName("filt");
    for(var i = 0; i<f.length; i++){
        if(f[i].checked){
            checked.push(f[i].attributes[2].value);
            //console.log(f[i].attributes[3].value);
        }
    }
    //console.log(checked);
    return checked;
}

