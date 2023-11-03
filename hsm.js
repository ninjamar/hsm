/*
    Goals 
    Easy
    Components that return html
        1. JS Templating with auto updating
        2. Scoping?

*/
window.hsmcomponents = [];
const interleave = ([ x, ...xs ], ys = []) =>
    x === undefined
        ? ys
        : [ x, ...interleave (ys, xs) ]

export class Component {
    fns = [];
    constructor(id){
        this.id = id;
        this.methodid = `hsm_component_${this.id}`;
    }
    selector(s){
        // Search within component instance
        // Refer to mangled ID's
        if (s[0] == "#")
            return this.element.querySelector("#" + this.methodid + "_" + s.slice(1))
        return this.element.querySelector(s);
    }
    html(code, ...f){
        // Check if f is a function
        f = f.map((x, i) => (typeof(x) == "function") ? 
            [
                // This allows us to run perform multiple expressions before returning
                this.fns.push(x),
                `hsmcomponents[${this.id}].fns[${i}]()`
            ][1] : x
        );
        var element = document.createElement("div");
        // Rejoin html
        element.innerHTML = interleave(code, f).join("");
        element.firstChild.id = this.methodid;
        // Unique/Mangled ID's
        element.querySelectorAll("[id]").forEach((x, i) => {
            x.id = this.methodid + "_" + x.id;
        });
        return element.innerHTML;
    }
    after(){}
}
export function use(q, Cls){
    // Initialize component with id
    var cls = new Cls(window.hsmcomponents.length);
    // Add component instance to component registery
    window.hsmcomponents.push(cls);
    // Render component o element
    document.querySelector(q).innerHTML = cls.render();
    cls.element = document.querySelector(q);
    // Execute after hook
    cls.after();
}