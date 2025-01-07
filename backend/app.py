from flask import Flask
from flask_cors import CORS
from config import Config
from extensions import db, jwt

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    db.init_app(app)
    jwt.init_app(app)
    
    CORS(app, resources={
        r"/api/*": {
            "origins": app.config['CORS_ORIGINS'],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "expose_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True,
            "max_age": 3600
        }
    })
    
    from routes.auth import auth_bp
    from routes.estudiantes import estudiantes_bp
    from routes.profesores import profesores_bp
    from routes.proyectos import proyectos_bp
    from routes.practicas import practicas_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(estudiantes_bp, url_prefix='/api')
    app.register_blueprint(profesores_bp, url_prefix='/api')
    app.register_blueprint(proyectos_bp, url_prefix='/api')
    app.register_blueprint(practicas_bp, url_prefix='/api')
    
    with app.app_context():
        db.create_all()
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)