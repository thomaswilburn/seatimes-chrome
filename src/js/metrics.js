var buckets = {};

var Timer = function(bucket, label) {
  if (!label) {
    label = bucket;
    bucket = "General";
  }
  if (!(this instanceof Timer)) return new Timer(bucket, label);
  this.bucket = bucket;
  this.label = label;
  this.started = Date.now();
  this.ended = null;
};

Timer.prototype = {
  end: function() {
    this.ended = Date.now();
    var elapsed = this.ended - this.started;
    //store value in the bucket for a label
    if (!buckets[this.bucket]) buckets[this.bucket] = {};
    if (!buckets[this.bucket][this.label]) buckets[this.bucket][this.label] = [];
    buckets[this.bucket][this.label].push(elapsed)
  }
};

var report = function() {
  //report metrics from window.performance and the buckets
  var metrics = { Process: [] };
  for (var b in buckets) {
    //find the average for each metric
    metrics[b] = {};
    for (var l in buckets[b]) {
      metrics[b][l] = buckets[b][l].reduce((p, v) => p + v) / buckets[b][l].length;
    }
  }
  //Add browser-tracked startup metrics
  var perf = window.performance;
  metrics.Process["App interactive"] = perf.timing.domInteractive - perf.timing.navigationStart;
  return metrics;
};

module.exports = { Timer, report };