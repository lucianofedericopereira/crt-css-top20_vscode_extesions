const file = "./FILES.BBS", bbs = "https://github.com/lucianofedericopereira",
  getFile = async url => {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return response.text();
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error fetching the file:', error);
      return false;
    }
  },
  parseFile = async data => {
    if (!data) return false;
    return data
      .replace(/&#8202;/gm, " ")
      .replace(/(\S[\w.-]*)\s+(.*)/gm, "$1&#8202;$2")
      .split(/\r?\n|\r|\n/g)
      .filter(Boolean)
      .map(e => {
        const [link, description] = e.trim().split("&#8202;", 2);
        const name = link
          .split('.')[1]
          .replace(/-/gm, ' ')
          .split(' ')
          .map(w => w[0].toUpperCase() + w.substring(1).toLowerCase())
          .join(' ')
          .replace(/vs\s?code/i, '')
          .trim();
        return { link, description, name };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  },
  renderLinks = async entries => {
    if (!Array.isArray(entries)) return;
    const screen = document.getElementById("screen");
    const fragment = document.createDocumentFragment();
    const baseUrl = 'https://marketplace.visualstudio.com/items?itemName=';
    entries.slice(0, 20).forEach((entry, index) => {
      const p = document.createElement('p');
      const a = document.createElement('a');
      const spanIndex = document.createElement('span');
      const spanDescription = document.createElement('span');
      spanIndex.textContent = String(index + 1).padStart(2, '0') + ".";
      spanDescription.textContent = `: ${entry.description.padEnd(72 - entry.name.length, " ")}`;
      a.href = `${baseUrl}${entry.link}`;
      a.target = '_blank';
      a.rel = 'noreferrer noopener nofollow';
      a.textContent = entry.name;
      a.setAttribute('data-index', index);
      p.appendChild(spanIndex);
      p.appendChild(document.createTextNode(" "));
      p.appendChild(a);
      a.appendChild(spanDescription);
      fragment.appendChild(p);
    });
    screen.appendChild(fragment);
  },
  themeSwitcher = async () => {
    const colors = ['amber', 'green', 'white'];
    const hash = window.location.hash.slice(1);
    const setColor = color => {
      const colorElement = document.getElementById('color');
      if (colorElement) {
        colorElement.className = "crt " + color;
        localStorage.setItem('terminalcolor', color);
      }
    };
    if (colors.includes(hash)) {
      setColor(hash);
    } else {
      const currentTheme = localStorage.getItem('terminalcolor');
      if (currentTheme && colors.includes(currentTheme)) {
        setColor(currentTheme);
      }
    }
    colors.forEach(col => {
      const button = document.getElementById('button' + col);
      if (button) {
        button.addEventListener("click", () => setColor(col), false);
      }
    });
  };
bbsLink = bbs => {
  const element = document.getElementById('contact');
  if (element) {
    element.setAttribute('data-url', bbs);
    element.addEventListener('click', event => {
      document.location.href = event.currentTarget.getAttribute('data-url');
    }, false);
  }
};
(async file => {
  try {
    const fileData = await getFile(file);
    if (fileData) {
      const parsedData = await parseFile(fileData);
      if (parsedData) {
        await renderLinks(parsedData);
        kbdHandler();
      }
    }
    themeSwitcher();
    bbsLink(bbs);
  } catch (error) {
    console.error('An error occurred:', error);
  }
})(file);
const kbdHandler = () => {
  const links = document.querySelectorAll('a[data-index]');
  let currentActiveIndex = -1;
  let isHovered = false;
  document.addEventListener('keydown', event => {
    if (!isHovered) {
      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight':
        case 'j':
        case 'l':
          event.preventDefault();
          links[currentActiveIndex]?.classList.remove('active');
          currentActiveIndex = (currentActiveIndex + 1) % links.length;
          links[currentActiveIndex].classList.add('active');
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
        case 'h':
        case 'k':
          event.preventDefault();
          links[currentActiveIndex]?.classList.remove('active');
          currentActiveIndex = (currentActiveIndex - 1 + links.length) % links.length;
          links[currentActiveIndex].classList.add('active');
          break;
        case ' ':
        case 'Enter':
          event.preventDefault();
          links[currentActiveIndex].click();
          break;
        case 'PageUp':
          event.preventDefault();
          links[currentActiveIndex]?.classList.remove('active');
          currentActiveIndex = 0;
          links[currentActiveIndex].classList.add('active');
          break;
        case 'PageDown':
          event.preventDefault();
          links[currentActiveIndex]?.classList.remove('active');
          currentActiveIndex = links.length - 1;
          links[currentActiveIndex].classList.add('active');
          break;
        case 'a':
          event.preventDefault();
          document.getElementById('buttonamber')?.click();
          break;
        case 'g':
          event.preventDefault();
          document.getElementById('buttongreen')?.click();
          break;
        case 'w':
          event.preventDefault();
          document.getElementById('buttonwhite')?.click();
          break;
      }
    }
  });
  links.forEach((link, index) => {
    link.addEventListener('mouseenter', () => {
      isHovered = true;
      links[currentActiveIndex]?.classList.remove('active');
      currentActiveIndex = index;
      link.classList.add('active');
    });
    link.addEventListener('mouseleave', () => {
      isHovered = false;
    });
  });
};
(() => {
    setTimeout(() => {
        setInterval(() => {
            const d = new Date();
            const time = d.toLocaleTimeString([], { hour12: true, hour: '2-digit', minute: '2-digit' });
            const colon = d.getSeconds() % 2 === 0 ? ':' : '\u200A\u2006';
            document.title = time.replace(':', colon);
        }, 1000);
    }, 4000);
})();
