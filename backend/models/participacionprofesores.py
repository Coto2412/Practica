from app import db

class ParticipacionProfesores(db.Model):
    __tablename__ = 'participacion_profesores'
    
    id = db.Column(db.Integer, primary_key=True)
    profesor_id = db.Column(db.Integer, db.ForeignKey('profesores.id'), nullable=False)
    proyecto_id = db.Column(db.Integer, db.ForeignKey('proyectos.id'), nullable=False)
    rol = db.Column(db.String(100), nullable=False)
    fecha_participacion = db.Column(db.Date, nullable=False)
    
    # Relaciones
    profesor = db.relationship('Profesor', foreign_keys=[profesor_id])
    proyecto = db.relationship('Proyecto', foreign_keys=[proyecto_id])
    
    def to_dict(self):
        return {
            'id': self.id,
            'profesor_id': self.profesor_id,
            'proyecto_id': self.proyecto_id,
            'rol': self.rol,
            'fecha_participacion': self.fecha_participacion.isoformat()
        }