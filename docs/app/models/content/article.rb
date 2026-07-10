class Content::Article < Perron::Resource
  CATEGORIES = {
    "get-started" => "Getting started",
    "basics" => "Basics",
    "advanced" => "Advanced",
    "extensions" => "Extensions"
  }

  Category = Data.define(:key, :name, :resources)

  def self.categories
    CATEGORIES.map do |key, name|
      resources = all.select { it.metadata.category == key }.sort_by { it.metadata.position.to_i }

      Category.new(key, name, resources)
    end
  end

  delegate :category, :position, :title, :description, to: :metadata

  adjacent_by :position, within: { category: Content::Article::CATEGORIES.keys }

  validates :title, :description, presence: true
  validates :category, inclusion: { in: CATEGORIES.keys }
  validates :position, numericality: { only_integer: true, greater_than_or_equal_to: 1 }

  def markdownify? = metadata.key?(:markdownify) ? metadata.markdownify : true
end
