class Content::Action < Perron::Resource
  GROUPS = %w[class attribute data_attribute clipboard confirm dialog element focus form reload request style scroll_to]

  delegate :position, :group, :title, :description, to: :metadata

  adjacent_by :position, within: :group

  validates :title, :description, presence: true
  validates :group, inclusion: { in: GROUPS }
  validates :position, numericality: { only_integer: true, greater_than_or_equal_to: 1 }

  def code_preview
    <<~MARKDOWN
    ```html
    #{content}
    ```
    MARKDOWN
  end

  def to_partial_path = "content/actions/group"
end
