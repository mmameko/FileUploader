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
        dropzoneLabel: "Click or drop files here",
        fileNameLabel: "Name",
        sizeNameLabel: "Size"
    };
    var DEFAULT_OPTIONS = {
        multiple: 'multiple',
        minSize: SIZES.B,
        maxSize: SIZES.GB * 100,
        measure: 'MB'
    };
    var dropzoneTemplate = "<div id='dropzone-{id}' class='dropzone'>" +
            "<p class='dropzone-label' id='dropzone-label-{id}'>{dropzoneLabel}</p>" +
            "<input id='input-file-{id}' type='file' class='input-file' {multiple}/>" +
        "</div>";
    var uploadItemTemplate = "<div class='file-container' id='file-{id}'>" +
            "{imageContainer}" +
            "<div class='file-info-container {cls}'>" +
                "<p class='info-row file-name'>" +
                    "<span class='info-label file-name-label'>{file-name-label}:</span>" +
                    "<span class='info-value file-name-value'>{file-name-value}</span>" +
                "</p>" +
                "<p class='info-row file-size'>" +
                    "<span class='info-label file-size-label'>{file-size-label}:</span>" +
                    "<span class='info-value file-size-value'>{file-size-value}</span>" +
                "</p>" +
                "<p class='info-row file-upload-progress'>" +
                    "<span class='file-upload-progress_container'></span>" +
                    "<span class='file-upload-progress_line'></span>" +
                    "<span class='file-upload-progress_percentage'>0%</span>" +
                "</p>" +
            "</div>" +
            "<div class='file-controls-container'>" +
                "{startBtn}" +
                "{pauseBtn}" +
                "{removeBtn}" +
            "</div>" +
        "</div>";
    var startBtnTemplate = "<input type='button' class='file-controls_btn file-controls_start' id='file-start-{id}'/>";
    var pauseBtnTemplate = "<input type='button' class='file-controls_btn file-controls_pause' id='file-pause-{id}'/>";
    var removeBtnTemplate = "<input type='button' class='file-controls_btn file-controls_remove' id='file-remove-{id}'/>";
    var imageTemplate = "<div class='image-cotainer'>" +
            "<img src='{imgSrc}'/>" +
        "</div>";
    var counter = 1;

    w.FileUploader = function(options){
        var isElement,
            template,
            input, container, label, c,
            files = [], fileInstancesList = [],
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

        label = d.getElementById('dropzone-label-' + counter);

        allowedTypes = allowedTypes.concat(options.allowedTypes);
        minSize = getSizeOption(options.minSize) || minSize;
        maxSize = getSizeOption(options.maxSize) || maxSize;
        checkMinMaxSize();

        c = counter;
        counter++;

        function UploadItem(options, id){
            var uploadContainer = d.createElement("div");
            var template = uploadItemTemplate;

            if(options.main.canStop){
                template = template.replace(/{pauseBtn}/gi, pauseBtnTemplate);
            } else{
                template = template.replace(/{pauseBtn}/gi, '');
            }

            template = template.replace(/{startBtn}/gi, startBtnTemplate);

            if(options.main.showImage){
                template = template.replace(/{imageContainer}/gi, imageTemplate);
            } else {
                template = template.replace(/{imageContainer}/gi, '');
            }

            template = template.replace(/{file-name-label}/gi, options.fileNameLabel || DEFAULT_LABEL.fileNameLabel);
            template = template.replace(/{file-name-value}/gi, options.name);
            template = template.replace(/{file-size-label}/gi, options.sizeNameLabel || DEFAULT_LABEL.sizeNameLabel);
            template = template.replace(/{file-size-value}/gi, getSize());

            template = template.replace(/{cls}/gi, getInfoCls());

            template = template.replace(/{removeBtn}/gi, removeBtnTemplate);
            template = template.replace(/{id}/gi, id);

            uploadContainer.innerHTML = template;

            container.insertBefore(uploadContainer, label);

            function getSize(){
                var measureType = options.main.measure || DEFAULT_OPTIONS.measure;
                var measureValue = SIZES[measureType];

                return (options.size / measureValue).toFixed(2) + measureType;

            }

            function getInfoCls(){
                return options.main.showImage ? 'with-image' : 'without-image';
            }
        }

        function showDialogWindow(event){
            input.click();
            event.stopPropagation();
        }

        function validate(fileList){
            var newFiles = [];
            fileList = Array.prototype.slice.call(fileList);

            validateType();
            validateSize();
            checkIfExisted(fileList);

            newFiles.forEach(function(f, index){
                var uploadFile = new UploadItem({
                    main: options,
                    name: f.name,
                    size: f.size
                }, c + '-' + index);

                fileInstancesList.push(uploadFile);
            });

            files = files.concat(newFiles);

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
                        newFiles.push(tf);
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

})(window, document);