class SongVersionsController < ApplicationController
  load_and_authorize_resource

  def create
    @song_version = current_user.song_versions.new(params[:song_version])
    # if no parent song was given, create one and set it as parent
    @song_version.song = Song.new unless @song_version.song_id
    
    if @song_version.save! && @song_version.song.save!
      render :json => @song_version
    else
      render :json => @song_version.errors, :status => :unprocessable_entity
    end
  end

  def undo(action)
    action.undo
    # retirer de l'arbre ?
  end

  def redo(action)
    action.execute
    # deja dans l'arbre ? remettre dans l'arbre ?
  end

  def set_title
    action = SetTitleAction.new params[:title]
    action.execute
    @song_version.action_tree << action
  end

  def set_bpm
    action = SetBPMAction.new params[:bpm]
    action.execute
    @song_version.action_tree << action
  end

  # def add_track
  #   action = AddTrackAction.new params[:track]
  #   action.execute
  #   @song_version.action_tree << action
  # end

  # def set_track_name
  #   action = SetTrackNameAction.new params[:track_id, :name]
  #   action.execute
  #   @song_version.action_tree.children["track_added_#{track_id}"] << action
  # end

  # def set_volume
  #   action = SetTrackVolumeAction.new params[:track_id, :volume]
  #   action.execute
  #   @song_version.action_tree.children["track_added_#{track_id}"] << action
  # end

  # def add_clip
  #   action = AddClipAction.new params[:track_id, :clip]
  #   action.execute
  #   @song_version.action_tree.children["track_added_#{track_id}"] << action
  # end

  # def offset_clip_source
  #   action = OffsetClipSourceAction.new params[:track_id, :clip_id, :offset]
  #   action.execute
  #   @song_version.action_tree.
  #     children["track_added_#{track_id}"].
  #     children["clip_added_#{clip_id}"] << action
  # end

  # def offset_clip_begin
  #   action = OffsetClipBeginAction.new params[:track_id, :clip_id, :offset]
  #   action.execute
  #   @song_version.action_tree.
  #     children["track_added_#{track_id}"].
  #     children["clip_added_#{clip_id}"] << action
  # end

  # def offset_clip_end
  #   action = OffsetClipEndAction.new params[:track_id, :clip_id, :offset]
  #   action.execute
  #   @song_version.action_tree.
  #     children["track_added_#{track_id}"].
  #     children["clip_added_#{clip_id}"] << action
  # end
end
