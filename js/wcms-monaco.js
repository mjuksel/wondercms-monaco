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

document.querySelectorAll('.editable').forEach((el) => {
  let wrapper = document.createElement('div');
  wrapper.id = `monaco_${el.id}`;
  wrapper.classList.add('text-left');
  el.parentElement.insertBefore(wrapper, el);
  makeEditor(el, wrapper);
});

function makeEditor(el, ed) {
  let txt = el.innerHTML;
  el.setAttribute('hidden', true);

  require(['vs/editor/editor.main'], () => {
    // create editor, i've added some basic settings.
    let editor = monaco.editor.create(ed, {
      value: txt,
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
        $.post('', {
          fieldname: el.id,
          content: editor.getValue(),
          target: el.dataset.target,
          token: token
        }).done(() => {
          $('#save').show();
          $('#save').delay(150).fadeOut();
        });
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
      updateHeight;
      requestAnimationFrame(updateHeight);
    });

    let initHeight = 0;
    // resize when lineCount changes.
    const updateHeight = () => {
      const lineHeight = editor.getOption(monaco.editor.EditorOption.lineHeight);
      const lineCount = editor.getModel().getLinesContent().length;
      const hght = lineHeight * (lineCount + 1);
      if (initHeight !== hght) {
        initHeight = hght;
        ed.style.height = `${hght}px`;
        editor.layout();
      }
    };
    updateHeight();
  });
}