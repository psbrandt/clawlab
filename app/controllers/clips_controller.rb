class ClipsController < ApplicationController
  load_and_authorize_resource :track
  load_and_authorize_resource :through => :track

  def create
    action = AddClipAction.new params[:clip]
    @song_version.action_tree.children["track_added_#{track_id}"] << action
    if @clip = action.execute
      render :json => @clip
    else
      render :json => @clip.errors, :status => :unprocessable_entity
    end
  end

  def offset_clip_source
    action = OffsetClipSourceAction.new params[:track_id, :clip_id, :offset]
    action.execute
    @song_version.action_tree.
      children["track_added_#{track_id}"].
      children["clip_added_#{clip_id}"] << action
  end

  def offset_clip_begin
    action = OffsetClipBeginAction.new params[:track_id, :clip_id, :offset]
    action.execute
    @song_version.action_tree.
      children["track_added_#{track_id}"].
      children["clip_added_#{clip_id}"] << action
  end

  def offset_clip_end
    action = OffsetClipEndAction.new params[:track_id, :clip_id, :offset]
    action.execute
    @song_version.action_tree.
      children["track_added_#{track_id}"].
      children["clip_added_#{clip_id}"] << action
  end
end
