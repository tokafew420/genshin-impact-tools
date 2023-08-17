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

    // Check if any element in an array satisfies a given condition
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

    // Create a deep copy of an object using JSON serialization
    app.clone = (obj) => JSON.parse(JSON.stringify(obj));

    // Create a debounced version of a function that delays its execution
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

    // Check if an object is null or undefined
    app.isNullOrUndefined = (obj) => typeof (obj) === 'undefined' || obj === null;

    // Find the index of an element in an array based on a key and value
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

    // Find an element in an array based on a key-value pair
    app.getBy = (arr, key, val) => {
        const idx = app.indexBy(arr, key, val);
        if (idx !== -1) return arr[idx];
    };

    // Create a deep copy of an element in an array based on a key-value pair
    app.cloneBy = (arr, key, val) => {
        const idx = app.indexBy(arr, key, val);
        if (idx !== -1) return app.clone(arr[idx]);
    };

    // Find the index of an element in an array based on the 'name' property
    app.indexByName = (arr, name) => app.indexBy(arr, 'name', name);

    // Generate a lowercased and hyphen-separated ID from a string
    app.id = (str) => String(str).toLowerCase().replace(/[^a-z0-9]/g, ' ').trim().replace(/\s+/g, '-');

    // Find an element in an array based on the 'name' property
    app.getByName = (arr, name) => app.getBy(arr, 'name', name);

    // Create a deep copy of an element in an array based on the 'name' property
    app.cloneByName = (arr, name) => app.cloneBy(arr, 'name', name);

    // Define filter functions used for array manipulation
    app.filters = {
        distinct: (val, idx, self) => self.indexOf(val) === idx,
        notNullOrUndefined: (val) => val !== null && val !== undefined
    };

    // Retrieve the first property value from an object that exists and is not null or undefined
    app.firstProp = (obj, ...args) => {
        if (obj) {
            for (let i = 0, ii = args.length; i < ii; i++) {
                if (!app.isNullOrUndefined(obj[args[i]])) return obj[args[i]];
            }
        }
    };

    // Remove an element from an array based on a specified key and value
    app.removeBy = (arr, key, val) => {
        // Find the index of the element with the specified key and value
        var idx = app.indexBy(arr, key, val);
        
        // If the element is found, remove it from the array and return it
        if (idx !== -1) {
            return arr.splice(idx, 1)[0];
        }
    };

    // Remove an element from an array based on the 'name' property value
    app.removeByName = (arr, val) => app.removeBy(arr, 'name', val);

    // Convert an RGBA color value to its corresponding hexadecimal format
    app.rgba2hex = (rgba) => `#${rgba.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+\.{0,1}\d*))?\)$/).slice(1).map((n, i) => (i === 3 ? Math.round(parseFloat(n) * 255) : parseFloat(n)).toString(16).padStart(2, '0').replace('NaN', '')).join('')}`;

    // Sort an array of objects based on a specified property, with an option for descending order
    app.sortBy = (prop, desc) => {
        desc = desc ? -1 : 1; // Determine sorting direction
        return (a, b) => {
            // Compare values and return appropriate sorting result
            return a[prop] < b[prop] ? -1 * desc :
                a[prop] === b[prop] ? 0 : 1 * desc;
        };
    };

    // Sum and group objects by their 'name' property, combining their 'count' values
    app.sumCountByName = (...args) => {
        const map = {}; // Initialize a map to store grouped items
        const final = []; // Initialize an array to store the final results

        // Check if 'args' is an array
        if (!Array.isArray(args)) return final;

        // Iterate through the provided arrays
        args.forEach((items) => {
            // Check if 'items' is an array
            if (!Array.isArray(items)) return;

            // Iterate through the items in the array
            items.forEach((item) => {
                if (item && item.name) {
                    // Check if the item already exists in the map
                    if (map[item.name]) {
                        // If it does, update the 'count' property
                        map[item.name].count += item.count || 0;
                    } else {
                        // If not, clone the item and add it to the final array
                        const clone = app.clone(item); // Assuming 'clone' method exists
                        clone.count = clone.count || 0;
                        final.push(map[item.name] = clone);
                    }
                }
            });
        });

        return final; // Return the array with combined and grouped items
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

    // Initialize a cache to store generated codes and their occurrences
    app.generateCodeCache = {};

    // Define a function to generate unique codes based on input strings
    app.generateCode = (str, len) => {
        // Initialize variables
        var name = str || ''; // Input string (or empty string if not provided)
        var code = 0; // Initialize the code value
        len = len || 3; // Desired length of the generated code (default: 3 characters)

        // Calculate the code value based on the characters in the input string
        for (var i = 0, ii = name.length; i < ii; i++) {
            code += name.charCodeAt(i) * (i + 1); // Multiply the character's ASCII value by its position and accumulate
        }

        // Calculate the first character of the generated code using a bitwise AND operation
        let x = code & 31; // Extract the last 5 bits of the code
        let y = chars[x]; // Get the corresponding character from the 'chars' string

        // Calculate the remaining characters of the generated code
        for (var i = 1; i < len; i++) {
            code >>= 5; // Shift the code value to the right by 5 bits
            x = code & 31; // Extract the last 5 bits of the updated code
            y += chars[x]; // Append the corresponding character to the 'y' string
        }

        // Check if the generated code already exists in the cache
        if (app.generateCodeCache[y]) {
            y += chars[app.generateCodeCache[y] - 1]; // Append a unique character to make the code truly unique
        }

        // Update the cache with the generated code and its occurrence count
        app.generateCodeCache[y] = (app.generateCodeCache[y] || 0) + 1;

        // Return the generated unique code
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
        // If the 'getCharacter' parameter is not provided, use a default function that returns the item itself
        getCharacter = getCharacter || ((item) => item);

        // Sort the 'collection' using a custom sorting function
        collection.sort((a, b) => {
            // Obtain the character data for items 'a' and 'b' using the provided 'getCharacter' function
            var a = getCharacter(a);
            var b = getCharacter(b);

            // Determine the region priority for comparison (Crossover characters have lower priority)
            var ar = a.region === 'Crossover' ? 0 : 1;
            var br = b.region === 'Crossover' ? 0 : 1;

            // Calculate the difference in region priority
            var x = ar - br;

            // If the region priority is not equal, return the result to prioritize by region
            if (x !== 0) return x;

            // If the region priority is equal, compare characters based on rarity
            x = a.rarity < b.rarity ? 1 :
                a.rarity === b.rarity ? 0 : -1;

            // If the rarity comparison result is not equal, return the result to prioritize by rarity
            if (x !== 0) return x;

            // If both region priority and rarity are equal, compare characters based on name
            return a.name < b.name ? -1 :
                a.name === b.name ? 0 : 1;
        });

        // Return the sorted 'collection'
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
        // Iterate over all elements with the attribute 'data-search-target'
        $('[data-search-target]').each(function () {
            // Get the input element associated with the iteration
            var $input = $(this);
            // Get the target element based on the value of 'data-search-target' attribute
            var $target = $($input.attr('data-search-target'));
            // Get the value of the 'data-search-item' attribute
            var item = $input.attr('data-search-item');
            // Determine whether scrolling into view is enabled based on the 'data-search-scroll' attribute
            var scrollIntoView = $input.attr('data-search-scroll') === 'true';

            // Check if the target element exists and 'data-search-item' is defined
            if ($target.length && item) {
                // Attach a change, keyup, and input event handler to the input element, debounced with a 200ms delay
                $input.on('change keyup input', app.debounce(function () {
                    // Get the trimmed and lowercased search term from the input element's value
                    var term = $input.val().trim().toLowerCase();
                    // Initialize a variable to track the first non-matching item for scrolling
                    let first = true;

                    // Check if the search term is empty
                    if (!term) {
                        // Remove the 'non-match' class from all items within the target element
                        $(item, $target).removeClass('non-match');
                    } else {
                        // Iterate over each item element within the target element
                        $(item, $target).each(function () {
                            // Get the current item element as a jQuery object
                            const $item = $(this);
                            // Determine if the item's text does not contain the search term
                            const nonMatch = term && $item.text().trim().toLowerCase().indexOf(term) === -1;
                            // Toggle the 'non-match' class on the item element based on the search result
                            $item.toggleClass('non-match', nonMatch);

                            // Scroll the first matching item into view if enabled and not already scrolled
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