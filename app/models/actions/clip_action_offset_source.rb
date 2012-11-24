class ClipActionOffsetSource < ClipAction
  include SetAttributeAction

  sets_clip_attribute :source_offset, :as => :offset, :type => Float

  def pretty_name
    "Move"
  end
end
