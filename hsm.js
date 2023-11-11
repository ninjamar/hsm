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
        this.options = options;
    }
    selector(s){
        return this.root.querySelector(s);
    }
    css(code, ...f){
        // This is for ease of syntax
        if (arguments.length == 1){
            
        }
        return interleave(code, f).join("");
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
        return element;
    }
    delete(){
        // Remove all references to component
        window.hsmcomponents = window.hsmcomponents.map((x) => x.id != this.id ? x : {id: -1});
        // Shadow root can never be removed so we remove all of it's children
        this.root.remove();
    }
    after(args){}
    style(){}
}

export function use(Cls, target, options = {}){
    // Initialize component with id
    let cls = new Cls(window.hsmcomponents.length, options);
    // Add component instance to component registery
    window.hsmcomponents.push(cls);
    
    // Shadow root wrapper
    let componentwrapper = document.createElement("div");
    componentwrapper.attachShadow({mode: "open"});

    // Append rendering to shadow root
    // root refers to the Element
    // shadowRoot refers to the "document"
    cls.root = componentwrapper.shadowRoot.appendChild(cls.render());
    cls.shadowRoot = componentwrapper.shadowRoot;

    // In CSS, use this to reference wrapper
    cls.root.id = "root";

    let sheet = new CSSStyleSheet();
    sheet.replaceSync(cls.style());
    cls.shadowRoot.adoptedStyleSheets.push(sheet);

    document.querySelector(target).appendChild(componentwrapper);

    cls.after(options.after);
    return cls;
}