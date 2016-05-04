var ipc = require("./ipc");
var metrics = require("./metrics");
var delegate = require("./delegate");

delegate("click", `[data-event="showMetrics"]`, () => console.log(metrics.report()));

/*

coordinating views:
- SectionView
  - updateList(section, data) - sets content
  - setTabs(sections)
- ArticleView
  - showArticle(data) - does sanitization before loading into the webview and triggering slide
- MetricsView
  - show(metrics) - Pass the object to template into the page

handling events--let's dispatch similar to Caret

*/