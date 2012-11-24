class ClipActionOffsetBegin < ClipAction
  include SetAttributeAction

  sets_clip_attribute :begin_offset, :as => :offset, :type => Float

  def pretty_name
    "Offset begin"
  end
end
