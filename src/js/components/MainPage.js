import { templates } from '../settings.js';
import utils from '../utils.js';

class MainPage {
    constructor(page) {
        const thisPage = this;

        thisPage.render(page);
        thisPage.initCarousel();
    }

    initCarousel() {
        const thisPage = this;

        let slideIndex = 0;
        thisPage.showSlides(slideIndex);
    }

    showSlides(slideIndex) {
        const thisPage = this;

        const slides = document.getElementsByClassName('carousel-item');
        const dots = document.getElementsByClassName('dot');

        for (let slide of slides) {
            slide.style.display = 'none';
        }
        slideIndex++;

        if (slideIndex > slides.length) {
            slideIndex = 1;
        }

        for (let dot of dots) {
            dot.className = dot.className.replace(' active', '');
        }

        slides[slideIndex - 1].style.display = 'flex';
        dots[slideIndex - 1].className += ' active';

        setTimeout(() => {
            thisPage.showSlides(slideIndex);
        }, 3000);
    }


    render(page) {
        const thisPage = this;

        const generatedHTML = templates.mainPage();

        thisPage.dom = {};

        thisPage.dom.wrapper = page;
        thisPage.element = utils.createDOMFromHTML(generatedHTML);
        thisPage.dom.wrapper.appendChild(thisPage.element);
    }
}

export default MainPage;
