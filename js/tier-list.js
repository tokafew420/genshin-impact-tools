app.require(['characters', 'elements', 'resources'],
    function (characters, elements, resources) {
        const defaults = 'S-ffd454-000--~A-af7ff5-000--~B-4bb4f3-000--~C-23f188-000--~D-b5b5b5-000--';
        const mapping = {
            "Aloy": "mcb",
            "Albedo": "bdc",
            "Diluc": "7tb",
            "Eula": "19a",
            "Ganyu": "ayb",
            "Hu Tao": "b5b",
            "Jean": "s9a",
            "Kaedehara Kazuha": "46p",
            "Kamisato Ayaka": "h4k",
            "Keqing": "6ec",
            "Klee": "g9a",
            "Mona": "39a",
            "Qiqi": "4ab",
            "Raiden Shogun": "b5j",
            "Sangonomiya Kokomi": "01t",
            "Tartaglia": "tue",
            "Traveler (Anemo)": "wrn",
            "Traveler (Electro)": "0ds",
            "Traveler (Geo)": "bnj",
            "Venti": "hwb",
            "Xiao": "kab",
            "Yoimiya": "t7c",
            "Zhongli": "36c",
            "Amber": "stb",
            "Barbara": "42c",
            "Beidou": "agc",
            "Bennett": "n9c",
            "Chongyun": "y6d",
            "Diona": "atb",
            "Fischl": "qec",
            "Kaeya": "ftb",
            "Kujou Sara": "ucf",
            "Lisa": "59a",
            "Ningguang": "7xe",
            "Noelle": "fec",
            "Razor": "2xb",
            "Rosaria": "e5c",
            "Sayu": "ycb",
            "Sucrose": "r8c",
            "Xiangling": "8xe",
            "Xingqiu": "r9c",
            "Xinyan": "ugc",
            "Yanfei": "pdc"
        };

        app.sortByCharacters(characters);

        const $page = $('.page');
        const $characters = $('#characters', $page);
        const $tierList = $('.tier-list table tbody', $page);
        const $modelRow = $('.tier-list-row', $tierList).detach();

        const parse = (data) =>
            (data || '').split('~').map((d) => {
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
        const reset = ($row) => {
            $row.find('.card-drag-container').each(function () {
                $characters.append(this);
            });
        };
        const get$row = (el) => $(el).closest('.tier-list-row');

        // Add new row
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

        $('.reset-all').on('click', function (e) {
            e.preventDefault();
            $tierList.find('.tier-list-ctrl.remove').click();

            // Create default tier list
            parse(defaults).forEach((row) => addRow(row));
        });

        // Generate and show share link
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

        // Create character table
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

        const shareLink = app.getQueryParam('share');
        const savedData = app.localStorage.get('tier-list');

        // Create default or shared tier list
        parse(decodeURIComponent(shareLink || savedData || defaults)).forEach((row) => {
            addRow(row);
        });
    });