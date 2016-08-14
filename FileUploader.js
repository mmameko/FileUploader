/**
 * Created by mmameko on 13.08.16.
 */

(function(w, d){
    var SIZES = {
        'B': 1,
        'KB': 1024,
        'MB': 1024 * 1024,
        'GB': 1024 * 1024 * 1024
    };
    var DEFAULT_LABEL = {
        dropzoneLabel: "Click or drop files here"
    };
    var DEFAULT_OPTIONS = {
        multiple: 'multiple',
        minSize: SIZES.B,
        maxSize: SIZES.GB * 100
    };
    var dropzoneTemplate = "<div id='dropzone-{id}' class='dropzone'>" +
            "<p class='dropzone-label'>{dropzoneLabel}</p>" +
            "<input id='input-file-{id}' type='file' class='input-file' {multiple}/>" +
        "</div>";
    var counter = 1;

    w.FileUploader = function(options){
        var isElement,
            template,
            input, container,
            files = [], tmpFiles = [],
            allowedTypes = [],
            minSize = options.minSize || DEFAULT_OPTIONS.minSize,
            maxSize = options.maxSize || DEFAULT_OPTIONS.maxSize;

        if(!options){
            return null;
        }

        if((isElement = options.target instanceof Element) || typeof options.target === "string"){
            this.target = isElement ? options.target : d.getElementById(options.target);
        }

        if(this.target === null){
            return null;
        }

        template = dropzoneTemplate;
        template = template.replace(/{id}/gi, counter);
        template = template.replace(/{dropZoneLabel}/gi, options.dropzoneLabel || DEFAULT_LABEL.dropzoneLabel);
        template = template.replace(/{multiple}/gi, getMultipleOption(options.multiple));
        this.target.innerHTML = template;

        input = d.getElementById('input-file-' + counter);
        input.addEventListener("change", function(e){
            validate(this.files);
        });

        container = d.getElementById('dropzone-' + counter);
        container.addEventListener("click", showDialogWindow);
        container.addEventListener("drop", function(e){
            validate(e.dataTransfer.files);
            e.stopPropagation();
            e.preventDefault();
        });
        container.addEventListener("dragover", function(e){
            e.preventDefault();
        });

        allowedTypes = allowedTypes.concat(options.allowedTypes);
        minSize = getSizeOption(options.minSize) || minSize;
        maxSize = getSizeOption(options.maxSize) || maxSize;
        checkMinMaxSize();

        counter++;

        function showDialogWindow(event){
            input.click();
            event.stopPropagation();
        }

        function validate(fileList){
            fileList = Array.prototype.slice.call(fileList);

            validateType();
            validateSize();
            checkIfExisted(fileList);

            function validateType(){
                fileList = fileList.filter(function(f){
                    var ext = f.name.split('.').reverse()[0];

                    if(allowedTypes.length === 0){
                        return true;
                    } else {
                        return allowedTypes.indexOf(ext) !== -1;
                    }
                });
            }

            function validateSize(){
                fileList = fileList.filter(function(file){
                    return file.size >= minSize && file.size <= maxSize;
                });
            }

            function checkIfExisted(){
                fileList.forEach(function(tf){
                    var filteredFiles = files.filter(function(f){
                        return f.name === tf.name;
                    });

                    if(!filteredFiles.length){
                        files.push(tf);
                    }
                });
            }
        }

        function getSizeOption(size){
            if(!size){
                return 0;
            }

            var num = parseFloat(size);
            var measurement = size.match(/[a-zA-Z]+$/);

            return measurement.length ? SIZES[measurement[0].toUpperCase()] * num : 0;
        }

        function checkMinMaxSize(){
            if(minSize > maxSize){
                maxSize = maxSize + minSize - (minSize = maxSize);
            }
        }

        this.getFileList = function(){
            return files;
        }
    };

    function getMultipleOption(multiple){
        if(typeof multiple === "undefined"){
            return DEFAULT_OPTIONS.multiple;
        } else {
            return multiple ? DEFAULT_OPTIONS.multiple : '';
        }
    }

    function added(event){
        var files = this.files;

        validateType();
        event.stopPropagation();
    }

})(window, document);