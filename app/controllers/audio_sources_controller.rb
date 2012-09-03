class AudioSourcesController < ApplicationController
  load_and_authorize_resource :song_version
  load_and_authorize_resource :audio_source, :through => :song_version

  def create
    file = params[:qqfile].is_a?(ActionDispatch::Http::UploadedFile) ? params[:qqfile] : params[:file]
    @audio_source = AudioSource.new
    @audio_source.audio_file = file
    if @audio_source.save
      render :json => { :success => true, :src => @audio_source.to_json }
    else
      render :json => @audio_source.errors.to_json
    end
  end

end
