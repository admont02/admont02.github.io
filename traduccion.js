document.addEventListener('DOMContentLoaded', () => {
    const textos = {
        es: {
            'logo-text': 'Adrián Montero',
            'description-text': 'Desarrollador de videojuegos',
            'proyectos-link': 'Proyectos',
            'sobre-mi-link': 'Sobre mí',
            'contacto-link': 'Contacto',
            'sobre-mi-title': 'Sobre mí',
            'sobre-mi-text': 'Hola, soy Adrián Montero, un desarrollador de videojuegos con experiencia en la creación de proyectos innovadores y desafiantes. Me apasiona el diseño de juegos y el desarrollo de nuevas tecnologías. Aquí puedes conocer más sobre mi carrera y mis habilidades.',
            'contacto-text': 'Si deseas ponerte en contacto conmigo, puedes enviarme un correo a <a href="mailto:adrimonteroc@gmail.com">adrimonteroc@gmail.com</a>. También puedes conectar conmigo a través de <a href="https://www.linkedin.com/in/adri%C3%A1n-montero-castrillo-83678b279/" target="_blank">LinkedIn</a>.'
        },
        en: {
            'logo-text': 'Adrian Montero',
            'description-text': 'Video Game Developer',
            'proyectos-link': 'Projects',
            'sobre-mi-link': 'About Me',
            'contacto-link': 'Contact',
            'sobre-mi-title': 'About Me',
            'sobre-mi-text': 'Hi, I am Adrian Montero, a video game developer with experience in creating innovative and challenging projects. I am passionate about game design and the development of new technologies. Here you can learn more about my career and skills.',
            'contacto-text': 'If you wish to get in touch with me, you can send me an email at <a href="mailto:adrimonteroc@gmail.com">adrimonteroc@gmail.com</a>. You can also connect with me through <a href="https://www.linkedin.com/in/adri%C3%A1n-montero-castrillo-83678b279/" target="_blank">LinkedIn</a>.'
        }
    };

    const updateText = (language) => {
        const elements = document.querySelectorAll('[id]');
        elements.forEach((el) => {
            const key = el.id;
            if (textos[language][key]) {
                el.innerHTML = textos[language][key];
            }
        });
    };

    document.getElementById('btn-es').addEventListener('click', () => {
        updateText('es');
    });

    document.getElementById('btn-en').addEventListener('click', () => {
        updateText('en');
    });
});
