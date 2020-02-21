require.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.20.0/dev/vs'
  }
});
self.MonacoEnvironment = {
  getWorkerUrl: () => proxy
};
let proxy = URL.createObjectURL(
  new Blob(
    [
      `
      self.MonacoEnvironment = { baseUrl: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.20.0/dev/' };
      importScripts('https://cdn.jsdelivr.net/npm/monaco-editor@0.20.0/dev/vs/base/worker/workerMain.js');
      `
    ],
    {
      type: ['text/html', 'javascript']
    }
  )
);

document.querySelectorAll('.editable').forEach((el, index, array) => {
  el.addEventListener(
    'click',
    () => {
      setTimeout(() => {
        let txtArea = el.firstChild;
        txtArea.removeAttribute('onblur');
        txtArea.classList.add('hide');
        require(['vs/editor/editor.main'], () => {
          // create editor, i've added some basic settings.
          var editor = monaco.editor.create(el, {
            value: txtArea.value,
            language: 'text/html',
            theme: 'vs-dark',
            tabSize: 2,
            scrollBeyondLastLine: false,
            minimap: {
              enabled: false
            },
            lineHeight: '23px',
            fontFamily: 'Fira Code',
            fontLigatures: true
          });

          // Save via Monaco internally :)
          // TODO: checkout these stuffs ->> precondition / keybindingContext / contextMenuGroupId / contextMenuOrder
          editor.addAction({
            id: 'save',
            label: `Save Wonders ;D`,
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S],
            run: () => {
              fieldSave(el.id, editor.getValue(), el.dataset.target);
              return null;
            }
          });

          // this one makes it so Enter actually goes to a new line.
          editor.addCommand(
            monaco.KeyCode.Enter,
            () => {
              editor.trigger('newline?', 'type', { text: '\n' });
            },
            'editorTextFocus && !suggestWidgetVisible && !renameInputVisible && !inSnippetMode && !quickFixWidgetVisible'
          );

          // fire events on typing/fold
          editor.onDidChangeModelDecorations(() => {
            updateHeight; // typing
            requestAnimationFrame(updateHeight); // folding
          });

          let initHeight = 0;
          // resize when lineCount changes.
          const updateHeight = () => {
            const lineHeight = editor.getOption(monaco.editor.EditorOption.lineHeight);
            const lineCount = editor.getModel().getLinesContent().length;
            const hght = lineHeight * (lineCount + 2);
            if (initHeight !== hght) {
              initHeight = hght;
              el.style.height = `${hght}px`;
              editor.layout();
            }
          };
        });
      });
    },
    { once: true }
  );
});
