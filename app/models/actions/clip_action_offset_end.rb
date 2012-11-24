class ClipActionOffsetEnd < ClipAction
  include SetAttributeAction

  sets_clip_attribute :end_offset, :as => :offset, :type => Float

  def pretty_name
    "Offset end"
  end

end
