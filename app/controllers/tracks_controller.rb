class TracksController < ApplicationController
  load_and_authorize_resource :song_version
  load_and_authorize_resource :through => :song_version

  def create
    action = AddTrackAction.new params[:track]
    @song_version.action_tree << action
    if @track = action.execute
      render :json => @track
    else
      render :json => @track.errors, :status => :unprocessable_entity
    end
  end

  def set_track_name
    action = SetTrackNameAction.new params[:name]
    action.execute
    @song_version.action_tree.children["track_added_#{track_id}"] << action
  end

  def set_volume
    action = SetTrackVolumeAction.new params[:volume]
    action.execute
    @song_version.action_tree.children["track_added_#{track_id}"] << action
  end

  def add_clip
    action = AddClipAction.new params[:clip]
    action.execute
    @song_version.action_tree.children["track_added_#{track_id}"] << action
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
