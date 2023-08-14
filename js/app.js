// Initialize the 'app' object and define a 'data' property on it
(function (app) {
    app.data = {};
    // Define a function to load required data before execution
    app.require = function (args, callback) {
        // Convert the argument to an array if it's a string
        if (typeof args === 'string') args = [args];
        // Create an array of promises to load data files
        var promises = args.map((arg) => {
            // Load JSON data using jQuery and store it in 'app.data'
            return app.data[arg] || (app.data[arg] = $.getJSON(`data/${arg}.json`).then((res, textStatus, jqXHR) => {
                console.debug('Required: ' + arg);
                return app.data[arg] = res.data;
            }));
        });

        // Wait for all promises to resolve and then execute the callback
        $.when.apply(this, promises).then(callback);
    };

    // Load data for the application
    app.require('characters');

    // Define a function to escape special characters in text
    const _escape = (text) => text.replaceAll('"', '&quot;');

    // Define template functions for generating HTML elements
    (() => {
        app.templates = {
            cardContainer: (rarity, opts) => {
                opts = opts || {};
                rarity = rarity || 1;
                if (opts.special) {
                    rarity = rarity + 's';
                }
                return `
<div class="card-container card-${rarity} ${opts.doubleLineText ? 'double-line-text' : ''}" role="button" tabindex="0">
    <img class="card-background-image" alt="${rarity} Star" src="./img/Rarity_${rarity}_background.png" />
</div>`
            },
            cardImg: (src, name, link) => `
<div class="card-image">
    <a href="${encodeURI(link)}" title="${_escape(name)}" target="_blank" tabindex="-1">
        <img alt="${_escape(name)}" src="./img/${src}" width="74" height="74" />
    </a>
    <div class="card-corner">
        <img alt="Card Corner.png" src="./img/Card_Corner.png" width="14" height="14" />
    </div>
</div>`,
            cardText: (text) => {
                var style = '';
                var width = app.getTextWidth(text, '12px Genshin');
                if (width > 70) {
                    style = `font-size: ${(70 / width).toFixed(2)}em;`;
                }
                return `<div class="card-text"><span class="card-font" style="${style}">${text}</span></div>`
            },
            cardIcon: (src, name, link) => `
<div class="card-icon"><span class="d-inline-block">
    <a href="${encodeURI(link)}" title="${_escape(name)}" target="_blank" tabindex="-1">
        <img alt="${_escape(name)}" src="./img/${src}" width="20" height="20">
        </a>
        </span></div>`,
            cardStar: (rarity) => {
                if (!rarity) return '';
                return `
<div class="card-stars star-${rarity}">
    <img alt="Icon ${rarity} Stars.png" src="./img/Icon_${rarity}_Stars.png" width="${app.templates.cardStarWidth(rarity)}" height="16" >
</div>`;
            },
            cardStarWidth: (rarity) => rarity === 5 && 60 ||
                rarity === 4 && 50 ||
                rarity === 3 && 39 ||
                rarity === 2 && 27 ||
                rarity === 1 && 16 || 0,
            cardSelect: () => `
<div class="card-selected">
    <img class="card-selected-top" src="./img/Card_Selected_Top.png" width="100%" />
    <img class="card-selected-bottom" src="./img/Card_Selected_Bottom.png" width="100%" />
    <div class="selected-check"><i class="fas fa-check"></i></div>
</div>`,
            cardHighlight: () => `<div class="card-highlight"></div>`
        };
    })();

    // Function to create a character card element
    app.makeCharacterCard = (name, highlight, selectable) => {
        // Retrieve character data by name
        var character = app.getCharacter(name);

        if (character) {
            // Create a container for the card using templates
            var $container = $(app.templates.cardContainer(character.rarity, {
                doubleLineText: true,
                special: character.region === 'Crossover'
            }));

            // Populate the container with card components
            $container.append(app.templates.cardImg(character.thumbnail, character.name, character.link))
                .append(app.templates.cardText(character.name))
                .append(app.templates.cardIcon(character.element.thumbnail, character.element.name, character.element.link));

            if (selectable) {
                $container.append(app.templates.cardSelect())
            }

            if (highlight) {
                $container.append(app.templates.cardHighlight())
            }

            // Attach data attributes to the container
            $container.data('resource', character)
                .attr('data-resource-id', character.id)
                .attr('data-resource-type', character.type)
                .attr('data-resource-rarity', character.rarity)
                .attr('data-resource-element', character.element.name);

            return $container;
        }
    };

    app.makeWeaponCard = (name, highlight, selectable) => {
        var weapon = app.getWeapon(name);

        if (weapon) {
            var $container = $(app.templates.cardContainer(weapon.rarity, {
                doubleLineText: true
            }));
            $container.append(app.templates.cardImg(weapon.thumbnail, weapon.name, weapon.link))
                .append(app.templates.cardText(weapon.name));

            if (selectable) {
                $container.append(app.templates.cardSelect())
            }

            if (highlight) {
                $container.append(app.templates.cardHighlight())
            }
            $container.data('resource', weapon)
                .attr('data-resource-id', weapon.id)
                .attr('data-resource-type', weapon.type)
                .attr('data-resource-rarity', weapon.rarity);

            return $container;
        }
    };

    app.makeResourceCard = (name, highlight, selectable) => {
        var resource = app.getResource(name);

        if (resource) {
            var $container = $(app.templates.cardContainer(resource.rarity, {
                doubleLineText: true
            }));
            $container.append(app.templates.cardImg(resource.thumbnail, resource.name, resource.link))
                .append(app.templates.cardText(resource.name))
                .append(app.templates.cardStar(resource.rarity));

            if (selectable) {
                $container.append(app.templates.cardSelect())
            }

            if (highlight) {
                $container.append(app.templates.cardHighlight())
            }
            $container.data('resource', resource)
                .attr('data-resource-id', resource.id)
                .attr('data-resource-type', resource.type);

            return $container;
        }
    };

    app.makeCountCard = (name, count) => {
        var resource = app.getResource(name);

        if (resource) {
            let text = count;
            if (typeof count === 'number') {
                text = count.toLocaleString('en-US', {
                    minimumFractionDigits: 0
                });
            }

            var $container = $(app.templates.cardContainer(resource.rarity));
            $container.append(app.templates.cardImg(resource.thumbnail, resource.name, resource.link))
                .append(app.templates.cardText(text))
                .append(app.templates.cardStar(resource.rarity));

            $container.data('resource', resource)
                .attr('data-resource-id', resource.id)
                .attr('data-resource-type', resource.type);

            return $container;
        }
    };

     // Utility functions for common operations
    app.any = (arr, fn, context) => {
        if (arr) {
            for (let i = 0, ii = arr.length; i < ii; i++) {
                if (fn.apply(context, [arr[i], i, arr]) === true) {
                    return true;
                }
            }
        }
        return false;
    };
    app.clone = (obj) => JSON.parse(JSON.stringify(obj));
    app.debounce = function debounce(func, wait, immediate) {
        var timeout;
        return function () {
            var context = this,
                args = arguments;
            var later = function () {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };
    app.isNullOrUndefined = (obj) => typeof (obj) === 'undefined' || obj === null;
    app.indexBy = (arr, key, val) => {
        if (typeof key === 'function') {
            for (let i = 0, ii = arr.length; i < ii; i++) {
                if (key.apply(val, [arr[i], i, arr])) {
                    return i;
                }
            }
        } else {
            for (let i = 0, ii = arr.length; i < ii; i++) {
                if (arr[i][key] === val) {
                    return i;
                }
            }
        }
        return -1;
    };

    app.getBy = (arr, key, val) => {
        const idx = app.indexBy(arr, key, val);
        if (idx !== -1) return arr[idx];
    };

    app.cloneBy = (arr, key, val) => {
        const idx = app.indexBy(arr, key, val);
        if (idx !== -1) return app.clone(arr[idx]);
    };

    app.indexByName = (arr, name) => app.indexBy(arr, 'name', name);
    app.id = (str) => String(str).toLowerCase().replace(/[^a-z0-9]/g, ' ').trim().replace(/\s+/g, '-');
    app.getByName = (arr, name) => app.getBy(arr, 'name', name);
    app.cloneByName = (arr, name) => app.cloneBy(arr, 'name', name);

    // Define filter functions and other utility functions

    app.filters = {
        distinct: (val, idx, self) => self.indexOf(val) === idx,
        notNullOrUndefined: (val) => val !== null && val !== undefined
    };
    app.firstProp = (obj, ...args) => {
        if (obj) {
            for (let i = 0, ii = args.length; i < ii; i++) {
                if (!app.isNullOrUndefined(obj[args[i]])) return obj[args[i]];
            }
        }
    };
    app.removeBy = (arr, key, val) => {
        var idx = app.indexBy(arr, key, val);
        if (idx !== -1) {
            return arr.splice(idx, 1)[0];
        }
    };
    app.removeByName = (arr, val) => app.removeBy(arr, 'name', val);
    app.rgba2hex = (rgba) => `#${rgba.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+\.{0,1}\d*))?\)$/).slice(1).map((n, i) => (i === 3 ? Math.round(parseFloat(n) * 255) : parseFloat(n)).toString(16).padStart(2, '0').replace('NaN', '')).join('')}`;
    app.sortBy = (prop, desc) => {
        desc = desc ? -1 : 1;
        return (a, b) => {
            return a[prop] < b[prop] ? -1 * desc :
                a[prop] === b[prop] ? 0 : 1 * desc;
        };
    };
    app.sumCountByName = (...args) => {
        const map = {};
        const final = [];

        if (!Array.isArray(args)) return final;
        args.forEach((items) => {
            if (!Array.isArray(items)) return;
            items.forEach((item) => {
                if (item && item.name) {
                    if (map[item.name]) {
                        map[item.name].count += item.count || 0;
                    } else {
                        const clone = app.clone(item);
                        clone.count = clone.count || 0;
                        final.push(map[item.name] = clone);
                    }
                }
            });
        });

        return final;
    };

    // Create a canvas element for measuring text width
    const canvas = document.createElement('canvas');
    app.getTextWidth = (text, font) => {
        if (!text) return 0;
        const context = canvas.getContext('2d');
        context.font = font;
        const longestWord = text.split(' ').reduce((acc, txt) => {
            return acc.length > txt.length ? acc : txt;
        }, '');
        const metrics = context.measureText(longestWord);
        return +(metrics.width).toFixed(2);
    };


    // Retrieve resource data by name
    app.getResource = (name) => {
        const res = app.cloneByName(app.data.resources, name);
        if (res) {
            res.id = app.id(res.name);
            res.thumbnail = res.thumbnail || 'Icon_Unknown.png';
        }

        return res;
    };

    // Apply resource data to objects
    app.applyResource = (source) => {
        if (Array.isArray(source)) {
            source.forEach((s) => app.applyResource(s));
        } else {
            for (var prop in source) {
                var property = prop + 's';
                if (app.data[property] && Array.isArray(app.data[property])) {
                    source[prop] = app.cloneByName(app.data[property], source[prop]);
                }
            }
        }
        return source;
    };

    // Retrieve character data by name
    app.getCharacter = (name) => {
        const character = app.cloneByName(app.data.characters, name);

        if (character) {
            character.id = app.id(character.name);
            character.thumbnail = character.thumbnail || 'Icon_Characters.png';
            app.applyResource(character);
        }

        return character;
    };

    // Retrieve weapon data by name
    app.getWeapon = (name) => {
        const weapon = app.cloneByName(app.data.weapons, name);
        weapon.id = app.id(weapon.name);
        weapon.thumbnail = weapon.thumbnail || 'Icon_Inventory_Weapons.png';

        return weapon;
    };

    // Generate unique codes based on strings
    const chars = 'abcdefghjkmnpqrstuwxyz0123456789';
    app.generateCodeCache = {};

    app.generateCode = (str, len) => {
        var name = str || '';
        var code = 0;
        len = len || 3;
        for (var i = 0, ii = name.length; i < ii; i++) {
            code += name.charCodeAt(i) * (i + 1);
        }
        let x = code & 31;
        let y = chars[x];
        for (var i = 1; i < len; i++) {
            code >>= 5;
            x = code & 31;
            y += chars[x];
        }

        if (app.generateCodeCache[y]) {
            y += chars[app.generateCodeCache[y] - 1];
        }
        app.generateCodeCache[y] = (app.generateCodeCache[y] || 0) + 1;
        return y;
    };
    
    // Define a utility for managing local storage
    app.localStorage = {
        get: (key) => {
            try {
                return JSON.parse(window.localStorage.getItem(key));
            } catch (err) {}
        },
        set: (key, data) => {
            window.localStorage.setItem(key, JSON.stringify(data));
        }
    };

    // Retrieve query parameters from the URL
    app.getQueryParam = (name) => {
        const urlSearchParams = new URLSearchParams(window.location.href.split('?')[1]);
        return urlSearchParams.get(name);
    };

    // Sort a collection of items by character data
    app.sortByCharacters = (collection, getCharacter) => {
        getCharacter = getCharacter || ((item) => item);

        collection.sort((a, b) => {
            var a = getCharacter(a);
            var b = getCharacter(b);
            var ar = a.region === 'Crossover' ? 0 : 1;
            var br = b.region === 'Crossover' ? 0 : 1;
            var x = ar - br;

            if (x !== 0) return x;

            x = a.rarity < b.rarity ? 1 :
                a.rarity === b.rarity ? 0 : -1;

            if (x !== 0) return x;

            return a.name < b.name ? -1 :
                a.name === b.name ? 0 : 1;
        });
        return collection;
    };

    // Function to get a file handle from the user
    app.getFile = async function (options) {
        options = options || { multiple: false };
        try {
            const [fileHandle] = await window.showOpenFilePicker(options);
            return await fileHandle.getFile();
        } catch (e) {
            return null;
        }
    }

    // Initialization when the DOM is ready
    $(() => {
        $('[data-search-target]').each(function () {
            var $input = $(this);
            var $target = $($input.attr('data-search-target'));
            var item = $input.attr('data-search-item');
            var scrollIntoView = $input.attr('data-search-scroll') === 'true';

            if ($target.length && item) {
                $input.on('change keyup input', app.debounce(function () {
                    var term = $input.val().trim().toLowerCase();
                    let first = true;
                    if (!term) {
                        $(item, $target).removeClass('non-match');
                    } else {
                        $(item, $target).each(function () {
                            const $item = $(this);
                            const nonMatch = term && $item.text().trim().toLowerCase().indexOf(term) === -1;
                            $item.toggleClass('non-match', nonMatch);
                            if (scrollIntoView && first && !nonMatch) {
                                $item[0].scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'start'
                                });
                                first = false;
                            }
                        });
                    }
                }, 200));
            }
        });
    });
})(window.app = window.app || {});