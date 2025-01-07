from app import db

class Proyecto(db.Model):
    __tablename__ = 'proyectos'
    
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(200), nullable=False)
    descripcion = db.Column(db.Text)
    estudiante_id = db.Column(db.Integer, db.ForeignKey('estudiantes.id'), nullable=False)
    profesor_guia_id = db.Column(db.Integer, db.ForeignKey('profesores.id'), nullable=False)
    profesor_informante_id = db.Column(db.Integer, db.ForeignKey('profesores.id'), nullable=False)
    nota = db.Column(db.Float, nullable=True)  
    estado = db.Column(db.String(20), nullable=True) 
    
    # Relaciones
    estudiante = db.relationship('Estudiante', foreign_keys=[estudiante_id])
    profesor_guia = db.relationship('Profesor', foreign_keys=[profesor_guia_id])
    profesor_informante = db.relationship('Profesor', foreign_keys=[profesor_informante_id])