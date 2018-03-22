'use strict';

// func wrapper
var wrapper = (func_string) => new Function("return " + func_string)();

Vue.component("upload-file", {
    template:`<div id="uploadZone">
                <div v-if="!rule">
                    <input type="file" @change="onFileChange">
                </div>
                <div v-else>
                    <span>{{ rule_name }} Uploaded! </span>
                    <button @click="removeRule">Remove rule</button>
                </div>
            </div>`,
    data: function() {
        return {
            rule: '',
            rule_name: ''
        }
    },
    methods: {
        onFileChange(e) {
          var files = e.target.files || e.dataTransfer.files;
          if (!files.length)
            return;
          this.createRule(files[0]);
        },
        createRule(file) {
          var reader = new FileReader();
          var vm = this;

          reader.onload = (e) => {
            vm.rule      = e.target.result;
            vm.rule_name = e.target.filename;
            vm.$emit('file-loaded', vm.rule, vm.rule_name);
          };
          reader.filename = file.name;
          reader.readAsText(file);
        },
        removeRule: function (e) {
          this.rule = '';
          this.$emit('file-removed');
        }
      }
});

Vue.component("editor", {
    template: `<div id="editor">
                    <textarea :value="input" @input="update"></textarea>
                    <div id="renderZone" v-html="result == '' ? compiledMarkdown : result"></div>
                </div>`,
    props: ['result'],
    data: function() {
        return {
            input: `# hello

* we built this not only for fun,
* but also for better work efficiency!
`
        }
    },
    computed: {
        compiledMarkdown: function() {
            return marked(this.input, { sanitize: true })
        },
    },
    methods: {
        update: _.debounce(function (e) {
            this.input = e.target.value;
            this.$emit('input-updated', this.input);
        }, 300)
    }
});

window.addEventListener('load', () => new Vue({
    el: "#illuminous",
    data:{
        ruleEngine: '',
        renderedResult: '',
        renderedHTML: ''
    },
    methods: {
        compiledMarkdown: function (input) {
            return marked(input, { sanitize: true })
        },
        loadRule: function(rule_data, file_name = null) {
            this.ruleEngine = rule_data;
            this.renderResult = 'Render Completed!';
        },
        removeRule: function() {
            this.renderedResult = '';
            this.ruleEngine = '';
        },
        renderRuleHTML: function(input) {
            if (this.ruleEngine != '') {
                let renderer = wrapper(this.ruleEngine);
                this.renderedHTML = renderer(input);
            } else {
                this.renderedHTML = this.compiledMarkdown(input);
            }
        }
    }
}));
