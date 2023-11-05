/*
    Copyright (c) 2023 ninjamar
    https://github.com/ninjamar/hsm
*/
/*
    
    1. CSS within element? Maybe use no mangle class
    2. Templating? Would involve arguments in `use`
*/
window.hsmcomponents = [];
const interleave = ([ x, ...xs ], ys = []) =>
    x === undefined
        ? ys
        : [ x, ...interleave (ys, xs) ]

export class Component {
    fns = [];
    constructor(id, options={}){
        this.id = id;
        this.methodid = `hsm_component_${this.id}`;
        this.options = options;
    }
    selector(s){
        // Search within component instance
        // Refer to mangled ID's
        // We have to query the parent node because elem.querySelector doesn't include the current element (searches through child nodes)
        // TODO - Shouldn't be nessisary anymore
        var e = this.element.parentNode || document; // IDK why
        if (s[0] == "#")
            return e.querySelector("#" + this.methodid + "_" + s.slice(1))
        return e.querySelector(s);
    }
    html(code, ...f){
        // Check if f is a function
        f = f.map((x, i) => (typeof(x) == "function") ? 
            [
                // This allows us to run perform multiple expressions before returning
                this.fns.push(x),
                `hsmcomponents[${this.id}].fns[${i}].bind(hsmcomponents[${this.id}])(event)`
            ][1] : x
        );
        let element = document.createElement("div");
        // Rejoin html
        element.innerHTML = interleave(code, f).join("");
        element.firstChild.id = this.methodid;
        // Unique/Mangled ID's
        element.querySelectorAll("[id]").forEach((x, i) => {
            x.id = this.methodid + "_" + x.id;
        });
        // INSANE
        // return element.innerHTML;
        return element.children[0];
    }
    delete(){
        // Remove all references
        console.log(window.hsmcomponents)
        //window.hsmcomponents = window.hsmcomponents.filter((x) => x.id != this.id);
        window.hsmcomponents = window.hsmcomponents.map((x) => x.id != this.id ? x : {id: -1});
        console.log(window.hsmcomponents);
        // Delete element
        this.element.remove();
    }
    after(args){}
}
export function use(Cls, q, options = {}){
    // Initialize component with id
    let cls = new Cls(window.hsmcomponents.length, options);
    // Add component instance to component registery
    window.hsmcomponents.push(cls);
    let target = document.querySelector(q);
    // Somehow this fixes everything
    cls.element = target.appendChild(cls.render());
    // Execute after hook
    cls.after(options.after);
    return cls;
}