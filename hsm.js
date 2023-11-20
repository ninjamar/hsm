/*
    Copyright (c) 2023 ninjamar
    https://github.com/ninjamar/hsm
*/


window.hsmcomponents = [];
const interleave = ([ x, ...xs ], ys = []) =>
    x === undefined
        ? ys
        : [ x, ...interleave (ys, xs) ]

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
    css(code, ...f){
        // TODO: Allow css as object
        // This allows clean syntax
        return interleave(code, f).join("");
    }
    html(code, ...f){
        // Check if f is a function
        f = f.map((x, i) => (typeof(x) == "function") ? 
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
        window.hsmcomponents = window.hsmcomponents.map((x) => x.id != this.hsmidid ? x : {id: -1});
        this.remove();
    }
    render(){}
    onmount(args){}
    getstyle(){}
}