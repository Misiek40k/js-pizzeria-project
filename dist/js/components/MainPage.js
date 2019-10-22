import { templates } from '../settings.js';
import utils from '../utils.js';

class MainPage{
    constructor(page){
        const thisPage = this;

        thisPage.render(page);
    }

    render(page){
        const thisPage = this;


        const generatedHTML = templates.mainPage();

        thisPage.dom = {};

        thisPage.dom.wrapper = page;
        thisPage.element = utils.createDOMFromHTML(generatedHTML);
        thisPage.dom.wrapper.appendChild(thisPage.element);
    }
}

export default MainPage;
