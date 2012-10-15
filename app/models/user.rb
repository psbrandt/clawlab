class User
  include Mongoid::Document
  include Mongoid::Timestamps
  # Include default devise modules. Others available are:
  # :token_authenticatable, :confirmable,
  # :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable, :token_authenticatable,
         :recoverable, :rememberable, :trackable, :validatable

  ## Database authenticatable
  field :email,              :type => String
  field :encrypted_password, :type => String

  validates_presence_of :email
  validates_presence_of :encrypted_password

  ## Recoverable
  field :reset_password_token,   :type => String
  field :reset_password_sent_at, :type => Time
 
  ## Rememberable
  field :remember_created_at, :type => Time

  ## Trackable
  field :sign_in_count,      :type => Integer, :default => 0
  field :current_sign_in_at, :type => Time
  field :last_sign_in_at,    :type => Time
  field :current_sign_in_ip, :type => String
  field :last_sign_in_ip,    :type => String

  ## Confirmable
  # field :confirmation_token,   :type => String
  # field :confirmed_at,         :type => Time
  # field :confirmation_sent_at, :type => Time
  # field :unconfirmed_email,    :type => String # Only if using reconfirmable

  ## Lockable
  # field :failed_attempts, :type => Integer, :default => 0 # Only if lock strategy is :failed_attempts
  # field :unlock_token,    :type => String # Only if unlock strategy is :email or :both
  # field :locked_at,       :type => Time

  ## Token authenticatable
  field :authentication_token, :type => String
  before_save :ensure_authentication_token
  
  index({ :email => 1 }, { :unique => true })
  field :name
  validates_presence_of :name
  attr_accessible :name, :email, :password, :password_confirmation, :remember_me

  has_and_belongs_to_many :bands
  has_and_belongs_to_many :friends, :class_name => "User"

  has_many :songs
  has_many :song_versions, :dependent => :destroy
  has_many :sent_requests, :class_name => "Request", :inverse_of => :sender, :dependent => :destroy
  has_many :received_requests, :class_name => "Request", :inverse_of => :receiver, :dependent => :destroy

  mount_uploader :avatar, ImageUploader
  attr_accessible :avatar, :avatar_cache, :remove_avatar

  def song_ids
    song_versions.map(&:song_id).uniq
  end

  def received_friend_requests
    received_requests.where :_type => "FriendRequest"
  end

  def received_band_requests
    received_requests.where :_type => "BandRequest"
  end

  def name_mail
    "\"#{name}\" <#{email}>"
  end

  def to_builder
    user = Jbuilder.new
    user.(self, :name)
    user.avatar_url self.avatar.url
    user
  end

end
