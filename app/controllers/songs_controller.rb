# -*- coding: utf-8 -*-
class SongsController < ApplicationController
  load_and_authorize_resource

  def index
    @songs = current_user.song_versions.map(&:song).uniq
  end
end
