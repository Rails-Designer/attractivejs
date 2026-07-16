// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails

import Attractive from "attractivejs";
import LivePreview from "actions/live_preview";

Attractive.activate({ addActions: { livePreview: LivePreview } });
