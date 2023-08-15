// Require necessary modules and data for character information, elements, and resources
app.require(['characters', 'elements', 'resources'],
    function (characters, elements, resources) {
        // Default data for tier list rows
        const defaults = 'S-ffd454-000--~A-af7ff5-000--~B-4bb4f3-000--~C-23f188-000--~D-b5b5b5-000--';
        // Generate a mapping of character names to unique codes
        const mapping = characters.reduce((m, character) => {
            m[character.name] = app.generateCode(character.name);
            return m;
        }, {});

        // Sort characters based on their names
        app.sortByCharacters(characters);

        // Elements in the page
        const $page = $('.page');
        const $characters = $('#characters', $page);
        const $tierList = $('.tier-list table tbody', $page);
        const $modelRow = $('.tier-list-row', $tierList).detach();

        // Function to parse tier list row data from a string representation
        const parse = (data) =>
            (data || '').split('~').map((d) => {
                // Function to extract row data from a row element
                const rowData = d.split('-');

                if (rowData) {
                    return {
                        name: rowData[0] || '',
                        bgColor: (rowData[1] && '#' + rowData[1]) || '',
                        fgColor: (rowData[2] && '#' + rowData[2]) || '',
                        fontSize: (rowData[3] && rowData[3] + 'px') || '',
                        characters: (rowData[4] || '').split('.')
                    };
                }
            }).filter((row) => !!row);
         // Function to add a new tier list row
        const getRowData = ($row, stringify) => {
            const data = {
                name: getRowText($row),
                bgColor: getRowBgColor($row),
                fgColor: getRowFgColor($row),
                fontSize: getRowFontSize($row)
            };

            if (stringify) {
                data.characters = $row.find('.tier-list-row-characters .card-drag-container [data-character-name]').map(function () {
                    var name = $(this).attr('data-character-name');
                    return mapping[name];
                }).get();

                return `${data.name}-${data.bgColor.replace('#', '')}-${data.fgColor.replace('#', '')}-${data.fontSize.replace('px', '')}-${data.characters.join('.')}`;
            }

            data.after = $row;
            return data;
        };
        // Function to add a new tier list row
        const addRow = (opts) => {
            opts = opts || {};
            const $row = $modelRow.clone();
            const $characterList = $('.tier-list-row-characters', $row);

            setRowText($row, opts.name || '');
            setRowBgColor($row, opts.bgColor || '');
            setRowFgColor($row, opts.fgColor || '');
            setRowFontSize($row, opts.fontSize || '');
            if (opts.characters) {
                opts.characters.forEach((code) => {
                    const name = Object.keys(mapping).filter((key) => mapping[key] === code)[0];

                    if (name) {
                        $page.find(`[data-character-name="${name}"]`).parent().appendTo($characterList);
                    }
                });
            }

            if (opts.after) {
                $row.insertAfter(opts.after);
            } else {
                $tierList.append($row);
            }

            $characterList.sortable({
                items: '.card-drag-container',
                appendTo: '.page-container',
                connectWith: '#characters, .tier-list-row-characters',
                containment: '.page-container',
                forcePlaceholderSize: true,
                revert: 200
            });

            return $row;
        };
        // Functions to get and set various attributes of a row


        const getRowText = ($row) => $row.find('.tier-list-row-name').val() || '';
        const setRowText = ($row, text) => {
            $row.find('.tier-list-row-name').text(text);
            return $row;
        };
        const getRowBgColor = ($row) => app.rgba2hex($row.find('.tier-list-row-name').css('background-color') || '');
        const setRowBgColor = ($row, color) => {
            $row.find('.tier-list-row-name').css('background-color', color);
            $row.find('.tier-list-ctrl.bg-color i').css('color', color);
            return $row;
        };
        const getRowFgColor = ($row) => app.rgba2hex($row.find('.tier-list-row-name').css('color') || '');
        const setRowFgColor = ($row, color) => {
            $row.find('.tier-list-row-name').css('color', color);
            $row.find('.tier-list-ctrl.fg-color i').css('color', color);
            return $row;
        };
        const getRowFontSize = ($row) => $row.find('.tier-list-row-name').css('font-size') || '';
        const setRowFontSize = ($row, size) => {
            $row.find('.tier-list-row-name').css('font-size', size);

            return $row;
        };
        // Function to reset a row to its initial state
        const reset = ($row) => {
            $row.find('.card-drag-container').each(function () {
                $characters.append(this);
            });
        };
        // Function to retrieve the closest tier list row element from a child element
        const get$row = (el) => $(el).closest('.tier-list-row');

        // Event handlers for various actions on tier list rows
        $tierList.on('click', '.tier-list-ctrl.add', function (e) {
                e.preventDefault();
                addRow(getRowData(get$row(this)));
            })
            // Change Background color
            .on('change', '.tier-list-bg-color', function () {
                const $this = $(this);
                const $row = get$row($this);
                const bgcolor = $this.val();

                setRowBgColor($row, bgcolor);
            })
            // Change foreground color
            .on('change', '.tier-list-fg-color', function () {
                const $this = $(this);
                const $row = get$row($this);
                const color = $this.val();

                setRowFgColor($row, color);
            })
            // Change font size
            .on('change', '.tier-list-font-size', function () {
                const $this = $(this);
                const $row = get$row($this);
                const size = $this.val();

                setRowFontSize($row, size);
            })
            // Reset - Move all characters back to character table
            .on('click', '.tier-list-ctrl.reset', function (e) {
                e.preventDefault();

                reset(get$row(this));
            })
            // Remove row
            .on('click', '.tier-list-ctrl.remove', function (e) {
                e.preventDefault();
                const $row = get$row(this);

                reset($row);
                $('.tier-list-row-characters', $row).sortable("destroy");
                $row.remove();
            });

        // Event handler to reset the entire tier list to defaults
        $('.reset-all').on('click', function (e) {
            e.preventDefault();
            $tierList.find('.tier-list-ctrl.remove').click();

            // Create default tier list
            parse(defaults).forEach((row) => addRow(row));
        });

        // Event handlers to generate and manage sharing a tier list link
        const $shareLink = $('#share-link')
        $('.share').on('click', function (e) {
            e.preventDefault();
            const data = $tierList.find('.tier-list-row').map(function () {
                const $row = $(this);
                return getRowData($row, true);
            }).get().join('~');

            const url = window.location.origin + window.location.pathname + '?share=' + encodeURIComponent(data);
            $shareLink.slideDown()
                .find('.alert-link')
                .attr('href', url)
                .text(url);
        });
        // Close share link alert
        $shareLink.find('.close-btn').on('click', (e) => {
            e.preventDefault();
            $shareLink.slideUp()
        });
        // Copy share link to clipboard
        $shareLink.find('.copy-btn').on('click', (e) => {
            e.preventDefault();
            navigator.clipboard.write([new ClipboardItem({
                "text/plain": new Blob([$shareLink.find('.alert-link').text()], {
                    type: "text/plain"
                })
            })]);

        });
        new bootstrap.Popover($shareLink.find('.copy-btn')[0]);

        // Save state on window unload
        // Save tier list state in local storage on window unload
        $(window).on('unload', () => {
            const data = $tierList.find('.tier-list-row').map(function () {
                const $row = $(this);
                return getRowData($row, true);
            }).get().join('~');

            app.localStorage.set('tier-list', data);
        });

        // Make tier list rows sortable
        $('.tier-list table').sortable({
            items: '.tier-list-row',
            containment: '.tier-list',
            handle: '.move',
            axis: 'y',
            tolerance: "pointer",
            forcePlaceholderSize: true,
            revert: 200
        });

        // Make character cards sortable
        $characters.sortable({
            items: '.card-drag-container',
            appendTo: '.page-container',
            connectWith: '.tier-list-row-characters',
            containment: '.page-container',
            forcePlaceholderSize: true,
            revert: 200
        });

        // Create character cards and populate character table
        characters.forEach(function (character) {
            app.applyResource(character);
            const name = character.name;
            let nameId = name.replaceAll(' ', '_');
            let rarity = character.rarity;

            if (name.startsWith('Traveler ')) {
                nameId = 'Traveler'
            }
            if (character.region === 'Crossover') {
                rarity = rarity + 's';
            }

            $characters.append(`<div class="card-drag-container d-inline-block p-1" >
                    <div class="card-${rarity}" data-character-name="${name}">
                        <a href="https://genshin-impact.fandom.com/wiki/${nameId}" title="${name}" target="_blank" tabindex="-1">
                            <img class="character-card-img" alt="${name}" src="./img/Character_${nameId}_Thumb.png" >
                        </a>
                        ${app.templates.cardIcon(character.element.thumbnail, character.element.name, character.element.link)}
                    </div>
                </div>`);
        });

        // Retrieve shared tier list data and saved data from local storage
        const shareLink = app.getQueryParam('share');
        const savedData = app.localStorage.get('tier-list');

        // Create default or shared tier list rows based on data
        parse(decodeURIComponent(shareLink || savedData || defaults)).forEach((row) => {
            addRow(row);
        });
    });