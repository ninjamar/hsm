/*
    Copyright (c) 2023 ninjamar
    https://github.com/ninjamar/hsm
*/


window.hsmcomponents = [];
/*
const interleave = ([ x, ...xs ], ys = []) =>
    x === undefined
        ? ys
        : [ x, ...interleave (ys, xs) ]*/
const interleave = (a, b) => a.reduce((arr, v, i) => arr.concat(v, b[i]), []).filter((x) => x  != undefined);

export default class Component extends HTMLElement {
    fns = [];
    constructor(){
        super();
    }
    connectedCallback(){
        if (this.parentNode instanceof ShadowRoot){
            // Normal instantiation
            this.hsmid = window.hsmcomponents.length;
            window.hsmcomponents.push(this);
            
            this.id = "root";

            this.append(...this.render());

            let sheet = new CSSStyleSheet();
            sheet.replaceSync(this.getstyle());
            this.parentNode.adoptedStyleSheets.push(sheet);

            this.onmount();
        } else {
            // Move element into shadow root
            // This if/else statement is for clarity of code
            let div = this.parentNode.appendChild(document.createElement("div"));
            div.attachShadow({mode: "open"});
            div.shadowRoot.appendChild(this);
        }
    }
    css(style, ...f){
        // Check if CSS is string
        if (typeof(style[0]) == "string"){
            return interleave(style, f).join("");
        }
        // Otherwise assume the CSS to be an object
        // For each outer key, return key {inner}
        return Object.entries(style).map(([k, v]) => `${k}{${
            // Return inner formatted as css
            Object.entries(v).map(([k, v]) => `${k}:${v}`).join(";")
        }}`).join("");
    }
    html(code, ...fn){
        // Check if f is a function
        fn = fn.map((x, i) => (typeof(x) == "function") ? 
            [
                // This allows us to run perform multiple expressions before returning
                this.fns.push(x),
                // TODO: Virtual dom should make window.hsmcomponents smaller and more efficient by deleting unused items
                `hsmcomponents[${this.hsmid}].fns[${i}].bind(hsmcomponents[${this.hsmid}])(event)`
            ][1] : x
        );

        let element = document.createElement("div");
        element.innerHTML = interleave(code, f).join("");
        return element.children;
    }
    delete(){
        // Remove all references to component
        window.hsmcomponents = window.hsmcomponents.map((x) => x.hsmid != this.hsmid ? x : {hsmid: -1});
        this.remove();
    }
    render(){}
    onmount(args){}
    getstyle(){}
}