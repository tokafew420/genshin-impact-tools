(function (app) {
    app.data = {};
    // Require data before run
    app.require = function (args, callback) {
        if (typeof args === 'string') args = [args];
        var promises = args.map((arg) => {
            return app.data[arg] || (app.data[arg] = $.getJSON(`data/${arg}.json`).then((res, textStatus, jqXHR) => {
                console.debug('Required: ' + arg);
                return app.data[arg] = res.data;
            }));
        });

        $.when.apply(this, promises).then(callback);
    };
    // Load data
    app.require('characters');

    const _escape = (text) => text.replaceAll('"', '&quot;');

    // Templates
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

    app.makeCharacterCard = (name, highlight, selectable) => {
        var character = app.getCharacter(name);

        if (character) {
            var $container = $(app.templates.cardContainer(character.rarity, {
                doubleLineText: true,
                special: character.region === 'Crossover'
            }));
            $container.append(app.templates.cardImg(character.thumbnail, character.name, character.link))
                .append(app.templates.cardText(character.name))
                .append(app.templates.cardIcon(character.element.thumbnail, character.element.name, character.element.link));

            if (selectable) {
                $container.append(app.templates.cardSelect())
            }

            if (highlight) {
                $container.append(app.templates.cardHighlight())
            }
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
            var text = count.toLocaleString('en-US', {
                minimumFractionDigits: 0
            });

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

    /***** Utils *****/
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
        for (var i = 0, ii = arr.length; i < ii; i++) {
            if (arr[i][key] === val) {
                return i;
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
    app.id = (str) => String(str).toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, '-');
    app.getByName = (arr, name) => app.getBy(arr, 'name', name);
    app.cloneByName = (arr, name) => app.cloneBy(arr, 'name', name);
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
    app.getResource = (name) => {
        const res = app.cloneByName(app.data.resources, name);
        res.id = app.id(res.name);

        return res;
    };

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

    app.getCharacter = (name) => {
        const character = app.cloneByName(app.data.characters, name);

        if (character) {
            character.id = app.id(character.name);
            app.applyResource(character);
        }

        return character;
    };

    app.getWeapon = (name) => {
        const weapon = app.cloneByName(app.data.weapons, name);
        weapon.id = app.id(weapon.name);

        return weapon;
    };

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

    app.getQueryParam = (name) => {
        const urlSearchParams = new URLSearchParams(window.location.href.split('?')[1]);
        return urlSearchParams.get(name);
    };

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
})(window.app = window.app || {});