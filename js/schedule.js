app.require(['characters', 'elements', 'resources'],
    function (characters, elements, resources) {
        var $elements = $('[data-resource-type]').each(function () {
            var $this = $(this);
            var type = $this.attr('data-resource-type');
            var name = $this.attr('data-resource-name');
            if (type === 'resource') {
                let card = app.makeResourceCard(name);
                if (card) $this.append(card);
            } else if (type === 'character') {
                let card = app.makeCharacterCard(name);
                if (card) $this.append(card);
            }
        });
    });