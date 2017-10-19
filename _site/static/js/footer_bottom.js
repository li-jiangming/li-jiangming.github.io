function footer_bottom(){
        var content_h = document.body.clientHeight;
        var window_h = window.innerHeight;
        var window_w = window.innerWidth;
        var footer = document.getElementsByTagName("footer")[0];
        if (window_w < 800) {
                footer.style.width = window_w;
        } else {
                footer.style.width = 800;                                                                         
        }
        footer.removeAttribute("class");
        if (content_h < window_h - 50) {
                footer.setAttribute("class", "fixed-bottom");
        }
}

footer_bottom();
window.onresize = function() {
        footer_bottom();
}
