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

    // Templates
    (() => {
        app.templates = {
            cardContainer: (rarity, opts) => {
                rarity = rarity || 1;
                return `
<div class="card-container card-${rarity} ${opts && opts.doubleLineText ? 'double-line-text' : ''}" role="button" tabindex="0">
    <img class="card-background-image" alt="${rarity} Star" src="./img/Rarity_${rarity}_background.png" />
</div>`
            },
            cardImg: (src, name, link) => `
<div class="card-image">
    <a href="${link}" title="${name}" target="_blank" tabindex="-1">
        <img alt="${name}" src="./img/${src}" width="74" height="74" />
    </a>
    <div class="card-corner">
        <img alt="Card Corner.png" src="./img/Card_Corner.png" width="14" height="14" />
    </div>
</div>`,
            cardText: (text) => `<div class="card-text"><span class="card-font">${text}</span></div>`,
            cardIcon: (src, name, link) => `
<div class="card-icon"><span class="d-inline-block">
    <a href="${link}" title="${name}" target="_blank" tabindex="-1">
        <img alt="${name}" src="./img/${src}" width="20" height="20">
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
                doubleLineText: true
            }));
            $container.append(app.templates.cardImg(character.thumbnail, character.displayName || character.name, character.link))
                .append(app.templates.cardText(character.name))
                .append(app.templates.cardIcon(character.element.thumbnail, character.element.name, character.element.link));

            if (selectable) {
                $container.append(app.templates.cardSelect())
            }

            if (highlight) {
                $container.append(app.templates.cardHighlight())
            }
            $container.data('resource', character)
                .attr('data-resource-type', character.type)
                .attr('data-resource-name', character.name);

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
                .attr('data-resource-type', resource.type)
                .attr('data-resource-name', resource.name);

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
    app.getByName = (arr, name) => app.getBy(arr, 'name', name);
    app.cloneByName = (arr, name) => app.cloneBy(arr, 'name', name);
    app.firstProp = (obj, ...args) => {
        if (obj) {
            for (let i = 0, ii = args.length; i < ii; i++) {
                if (!app.isNullOrUndefined(obj[args[i]])) return obj[args[i]];
            }
        }
    };
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

    app.getResource = (name) => {
        return app.cloneByName(app.data.resources, name);
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
        var character = app.cloneByName(app.data.characters, name);

        if (character) {
            app.applyResource(character);
        }

        return character;
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
})(window.app = window.app || {});